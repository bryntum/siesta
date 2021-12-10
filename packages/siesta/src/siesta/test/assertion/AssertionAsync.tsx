import { AnyFunction, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { serializable } from "../../../serializable/Serializable.js"
import { MAX_SMI, OrPromise, SetTimeoutHandler } from "../../../util/Helpers.js"
import { delay, waitFor, WaitForResult } from "../../../util/TimeHelpers.js"
import { isFunction, isNumber, isString } from "../../../util/Typeguards.js"
import { luid, LUID } from "../../common/LUID.js"
import { Assertion, AssertionAsyncCreation, AssertionAsyncResolution, TestNodeResult } from "../TestResult.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * An options object for the [[Test.waitFor|waitFor]] test class method
 */
export type WaitForOptions<R> = {
    /**
     * A condition checker function. Can be `async`. Should return some "truthy" value, indicating the condition has been met.
     * This value will be returned from the [[Test.waitFor|waitFor]] assertion itself.
     */
    condition       : () => OrPromise<R>,

    /**
     * A trigger function. This function is called once the waiting has started. It allows to avoid race conditions.
     *
     * For example, the typical mistake, which causes the race condition, is to call some method (which will trigger
     * an event) and then start waiting for that event. The event might be triggered synchronously (for example if
     * caching is applied), so it will be _already_ triggered, by the time we start waiting for it.
     *
     * In pseudo-code:
     *
     * ```javascript
     * // if caching is applied, the `load` event
     * // will be triggered in this method
     * dataStore.loadData()
     *
     * // by this time, the event might be already fired
     * // so waiting will never complete
     * await t.waitForEvent(dataStore, 'load')
     * ```
     *
     * The correct way would be first start waiting for event, and then "trigger" the action, that causes the waiting
     * to complete:
     *
     * ```javascript
     * await t.waitForEvent(dataStore, 'load', {
     *     trigger : () => dataStore.loadData()
     * })
     * ```
     */
    trigger         : AnyFunction,

    /**
     * Maximum amount of time, to wait for condition, in milliseconds. After that time, assertion will be marked as failed.
     * If not provided the [[TestDescriptor.waitForTimeout|waitForTimeout]] will be used.
     */
    timeout         : number,

    /**
     * The polling interval, in milliseconds. The condition checker function is called once for each interval.
     * If not provided the [[TestDescriptor.waitForPollInterval|waitForPollInterval]] will be used.
     */
    interval        : number,

    /**
     * The description for the assertion
     */
    description     : string

    reporting       : WaitForReporting<R>
}

export type WaitForReporting<R> = {
    assertionName           : string,

    onConditionMet?         : (waitRes : WaitForResult<R>, waitOptions : WaitForOptions<R>) => XmlElement,
    onException?            : (waitRes : WaitForResult<R>, waitOptions : WaitForOptions<R>) => XmlElement,
    onTimeout?              : (waitRes : WaitForResult<R>, waitOptions : WaitForOptions<R>) => XmlElement
}

const defaultWaitForReporting : WaitForReporting<unknown> = {
    assertionName           : 'waitFor',

    onConditionMet          : (waitRes : WaitForResult<unknown>, waitOptions : WaitForOptions<unknown>) =>
        <div>
            Waited { waitRes.elapsedTime }ms to fulfill the condition
        </div>,
    onException             : (waitRes : WaitForResult<unknown>, waitOptions : WaitForOptions<unknown>) =>
        <div>
            <div>Exception thrown from condition checker function:</div>
            <div>{ String(waitRes.exception) }</div>
        </div>,
    onTimeout               : (waitRes : WaitForResult<unknown>, waitOptions : WaitForOptions<unknown>) =>
        <div>
            Waiting for condition aborted by timeout ({ waitOptions.timeout }ms)
        </div>
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type AsyncGapId = number

type AsyncGapInfo       = {
    handler         : SetTimeoutHandler,
    finalize        : Function
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionAsync extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionAsync extends base {
        // this promise should not reject, its only used to keep the test going
        ongoing             : Promise<any>          = Promise.resolve()

        // this mess is because of the declaration files generation support
        getDefaultTimeout () : number {
            return this.descriptor.defaultTimeout
        }
        get defaultTimeout () : number {
            return this.getDefaultTimeout()
        }


        // this mess is because of the declaration files generation support
        getWaitForTimeout () : number {
            return this.descriptor.waitForTimeout ?? this.descriptor.defaultTimeout
        }
        get waitForTimeout () : number {
            return this.getWaitForTimeout()
        }


        // this mess is because of the declaration files generation support
        getWaitForPollInterval () : number {
            return this.descriptor.waitForPollInterval
        }
        get waitForPollInterval () : number {
            return this.getWaitForPollInterval()
        }


        gaps : Map<LUID, AsyncGapInfo>      = new Map()

        /**
         * Normally, to test the asynchronous code, you just make your test function `async` and `await` on any asynchronous
         * method call inside of it:
         *
         * ```javascript
         * import { it } from "siesta/index.js"
         * import { MyClass } from "my-lib"
         *
         * it('Testing asynchronous code should work', async t => {
         *     const myClass       = new MyClass()
         *
         *     await myClass.asyncMethod('do something')
         * })
         * ```
         *
         * However, for example if code is using callbacks, you might not have a `Promise` instance to `await` for.
         *
         * In such case, use this method to indicate the beginning of the "asynchronous gap" in the code flow. Each gap should be finalized
         * with the {@link endAsync} call within the `timeout` milliseconds, otherwise a failed assertion will be reported.
         *
         * The test will wait for all asynchronous gaps to complete before it will finalize.
         *
         * For example:
         * ```javascript
         * import { it } from "siesta/index.js"
         * import { MyClass } from "my-lib"
         *
         * it('Testing asynchronous code should work', t => {
         *     const myClass        = new MyClass()
         *
         *     // indicate async gap starts
         *     const async          = t.beginAsync()
         *
         *     myClass.asyncMethodWithCallback(() => {
         *         // indicate async gap completes
         *         t.endAsync(async)
         *     })
         * })
         * ```
         *
         * @category Asynchronicity
         * @param {Number} time The maximum time (in ms) to wait until forcing the finalization of this async gap.
         * Optional, default timeout is defined with [[TestDescriptor.defaultTimeout|defaultTimeout]] config option.
         *
         * @return The "gap id" opaque object, which should be passed to the {@link endAsync} call.
         */
        beginAsync (timeout : number = this.defaultTimeout) : AsyncGapId {
            const gapId         = luid()
            const sourcePoint   = this.getSourcePoint()

            const ongoingPromise    = new Promise<void>(resolve => {

                const handler       = setTimeout(() => {
                    if (this.gaps.has(gapId)) {
                        this.gaps.delete(gapId)

                        this.addResult(Assertion.new({
                            name            : 'beginAsync',
                            sourcePoint,
                            passed          : false,
                            description     : `No matching 'endAsync' call within ${ timeout }ms`
                        }))

                        resolve()
                    }
                }, timeout)

                this.gaps.set(gapId, { handler, finalize : resolve })
            })

            this.ongoing        = this.ongoing.then(() => ongoingPromise)

            return gapId
        }


        /**
         * This method finalizes the "asynchronous gap" started with {@link beginAsync}.
         *
         * @category Asynchronicity
         * @param gapId The gap id to finalize (returned by the {@link beginAsync} method)
         */
        endAsync (gapId : AsyncGapId) {
            const gapInfo       = this.gaps.get(gapId)

            if (gapInfo !== undefined) {
                this.gaps.delete(gapId)

                clearTimeout(gapInfo.handler)

                gapInfo.finalize()
            }
        }


        async keepAlive <R> (during : Promise<R>) : Promise<R> {
            const async     = this.beginAsync(MAX_SMI)

            try {
                return await during
            } finally {
                this.endAsync(async)
            }
        }

        /**
         * This assertion passes, if waiting for some condition has completed successfully, within the expected timeout.
         *
         * The condition to wait for should be specified as a `checker` function. It can be `async` if needed (return a `Promise`).
         * For the waiting to complete, the condition checker should return some "truthy" value, like `true`, `1`, `'some_string'`, etc.
         * That value (wrapped in a `Promise`) will be returned from the `waitFor` method itself.
         *
         * Alternatively, this method can just await for certain time.
         *
         * This method has 3 overloads:
         * - one for waiting the specified time
         * - one when checker function is provided directly in the argument
         * - one with [[WaitForOptions|options]] argument. In this overload, all options are available, for example,
         * one can customize the maximum time to wait - `timeout`.
         *
         * Note, this method is `async`. Don't forget to `await` on it. .
         *
         * For example:
         *
         * ```ts
         * await t.waitFor(() => /Special/.test(document.title))
         *
         * await t.waitFor({
         *     condition    : () => document.readyState === 'complete'),
         *     timeout      : 30000,
         *     interval     : 1000
         * })
         *
         * const elements = await t.waitFor(() => {
         *     const els    = document.querySelectorAll('.some_class')
         *
         *     return els.length > 0 ? els : null
         * })
         * ```
         *
         * IMPORTANT: To avoid race conditions, always start waiting for certain event, *before* triggering it.
         * See the trigger option in the [[WaitForOptions]] object for more details.
         *
         * @category Asynchronicity
         * @param waiting
         * @param description
         */
        async waitFor <R> (waiting : number, description? : string) : Promise<R>
        async waitFor <R> (waiting : () => OrPromise<R>, description? : string) : Promise<R>
        async waitFor <R> (waiting : Partial<WaitForOptions<R>>) : Promise<R>
        async waitFor <R> (
            ...args :
                | [ waiting : number, description? : string ]
                | [ waiting : () => OrPromise<R>, description? : string ]
                | [ waiting : Partial<WaitForOptions<R>> ]
        ) : Promise<R> {
            const waitForTime       = isNumber(args[ 0 ]) ? args[ 0 ] : undefined
            const options           = isFunction(args[ 0 ]) || isNumber(args[ 0 ]) ? undefined : args[ 0 ]
            const condition         = isFunction(args[ 0 ]) ? args[ 0 ] : options?.condition
            const timeout           = options?.timeout ?? this.waitForTimeout
            const description       = isString(args[ 1 ]) ? args[ 1 ] : options?.description
            const interval          = options?.interval ?? this.waitForPollInterval
            const trigger           = options?.trigger

            const normalizedOptions : WaitForOptions<R> = {
                condition,
                timeout,
                description,
                interval,
                trigger,
                reporting : options?.reporting ?? defaultWaitForReporting
            }

            const creation = this.addResult(AssertionWaitForCreation.new({
                name            : normalizedOptions.reporting.assertionName,
                description
            }))

            const promise : Promise<WaitForResult<R>>  = waitForTime !== undefined
                ? this.keepAlive(
                    delay(waitForTime).then(() => {
                        return { conditionIsMet : true, result : undefined, exception : undefined, elapsedTime : waitForTime }
                    })
                )
                : this.keepAlive(waitFor(condition, timeout, interval))

            trigger?.()

            const res       = await promise

            if (res.conditionIsMet) {
                this.addAsyncResolution(AssertionWaitForResolution.new({
                    creationId  : creation.localId,
                    passed      : true,
                    elapsedTime : res.elapsedTime,

                    annotation  : (normalizedOptions.reporting.onConditionMet ?? defaultWaitForReporting.onConditionMet)(res, normalizedOptions)
                }))

                return res.result
            } else {
                this.addAsyncResolution(AssertionWaitForResolution.new({
                    creationId      : creation.localId,
                    passed          : false,
                    elapsedTime     : res.elapsedTime,

                    timeoutHappened : res.exception === undefined,
                    exception       : res.exception,

                    annotation      : res.exception
                        ? (normalizedOptions.reporting.onException ?? defaultWaitForReporting.onException)(res, normalizedOptions)
                        : (normalizedOptions.reporting.onTimeout ?? defaultWaitForReporting.onTimeout)(res, normalizedOptions)
                }))

                return undefined
            }
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// we use the final class as Mixin class here, (even that a simple plain class would be enough)
// for the purpose of declaration files generation

@serializable({ id : 'AssertionWaitForCreation' })
export class AssertionWaitForCreation extends Mixin(
    [ AssertionAsyncCreation ],
    (base : ClassUnion<typeof AssertionAsyncCreation>) =>

    class AssertionWaitForCreation extends base {
        $resolution     : AssertionWaitForResolution          = undefined

        get resolution () : AssertionWaitForResolution | null {
            return this.$resolution
        }
        set resolution (value : AssertionWaitForResolution) {
            this.$resolution    = value
        }

        name            : string        = 'waitFor'
    }
) {}


@serializable({ id : 'AssertionWaitForResolution' })
export class AssertionWaitForResolution extends Mixin(
    [ AssertionAsyncResolution ],
    (base : ClassUnion<typeof AssertionAsyncResolution>) =>

    class AssertionWaitForResolution extends base {
        elapsedTime     : number            = 0

        timeoutHappened : boolean           = false

        exception       : unknown           = undefined
    }
) {}
