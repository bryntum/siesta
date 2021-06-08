import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { Serializable, serializable } from "../../../serializable/Serializable.js"
import { delay, OrPromise, SetTimeoutHandler } from "../../../util/Helpers.js"
import { isFunction } from "../../../util/Typeguards.js"
import { luid, LUID } from "../../common/LUID.js"
import { Assertion, AssertionAsyncCreation, AssertionAsyncResolution, Exception, Result, SourcePoint, TestNodeResult } from "../TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * An argument for the [[Test.waitFor|waitFor]] test class method, denoting the "waiting"
 */
export type WaitForArg<R> = {
    /**
     * A condition checker function. Can be `async`. Should return some "truthy" value, indicating the condition has been met.
     * This value will be returned from the [[Test.waitFor|waitFor]] assertion itself.
     */
    condition       : () => OrPromise<R>,

    /**
     * Maximum amount of time, to wait for condition, in milliseconds. After that time, assertion will be marked as failed.
     * If not provided the [[TestDescriptor.waitForTimeout|waitForTimeout]] will be used.
     */
    timeout?        : number,

    /**
     * The polling interval, in milliseconds. The condition checker function is called once for each interval.
     * If not provided the [[TestDescriptor.waitForPollInterval|waitForPollInterval]] will be used.
     */
    interval?       : number,

    /**
     * The description for the assertion
     */
    description?    : string
}

//---------------------------------------------------------------------------------------------------------------------
export type AsyncGapId = number

type AsyncGapInfo       = {
    handler         : SetTimeoutHandler,
    finalize        : Function
}

//---------------------------------------------------------------------------------------------------------------------
export class AssertionAsync extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionAsync extends base {
        // this promise should not reject, its only used to keep the test going
        ongoing             : Promise<any>          = Promise.resolve()


        get defaultTimeout () : number {
            return this.descriptor.defaultTimeout
        }

        get waitForTimeout () : number {
            return this.descriptor.waitForTimeout
        }
        get waitForPollInterval () : number {
            return this.descriptor.waitForPollInterval
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
                            description     : `No matching 'endAsync' call within ${timeout}ms`
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
         * @param gapId The gap id to finalize (returned by the {@link beginAsync} method)
         */
        endAsync (gapId : AsyncGapId) {
            const gapInfo       = this.gaps.get(gapId)

            if (gapInfo !== undefined) {
                clearTimeout(gapInfo.handler)

                this.gaps.delete(gapId)

                gapInfo.finalize()
            }
        }


        keepAlive <R> (during : Promise<R>) : Promise<R> {
            return during
        }

        /**
         * This assertion passes, if the `waiting` has completed successfully, within the expected timeout.
         * The `waiting` argument can be either a condition checker function, or the [[WaitForArg]] object.
         *
         * For the waiting to complete, the condition checker function should return some truthy value.
         * That value (wrapped in a Promise) will be returned from the `waitFor` method.
         *
         * Note, this method is `async`. Don't forget to `await` on it.
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
         * @param waiting
         * @param description
         */
        async waitFor <R> (waiting : (() => OrPromise<R>) | WaitForArg<R>, description? : string) : Promise<R> {
            let condition : () => OrPromise<R>
            let timeout : number    = this.waitForTimeout || this.defaultTimeout
            let desc : string       = description
            let pollInterval        = this.waitForPollInterval

            if (isFunction(waiting)) {
                condition           = waiting
            } else {
                condition           = waiting.condition
                timeout             = waiting.timeout ?? timeout
                desc                = waiting.description
                pollInterval        = waiting.interval ?? pollInterval
            }


            const creation = this.addResult(AssertionWaitFor.new({
                name            : 'waitFor',
                description     : desc
            }))

            const res       = await this.keepAlive(this.doWaitFor(condition, timeout, pollInterval))

            if (res.conditionIsMet) {

                this.addAsyncResolution(AssertionAsyncResolution.new({
                    creationId  : creation.localId,
                    passed      : true
                }))

                return res.result
            } else {
                this.addAsyncResolution(AssertionAsyncResolution.new({
                    creationId      : creation.localId,
                    passed          : false,
                    timeoutHappened : res.exception === undefined
                }))

                if (res.exception !== undefined) {
                    this.addResult(Exception.new({
                        exception       : res.exception
                    }))
                }

                return undefined
            }
        }


        async doWaitFor <R> (condition : () => OrPromise<R>, timeout : number, interval : number)
            : Promise<{ conditionIsMet : boolean, result : R, exception : unknown }>
        {
            const start             = Date.now()

            let result : R

            do {
                try {
                    result = await condition()
                } catch (e) {
                    return { conditionIsMet : false, result : undefined, exception : e }
                }

                if (result)
                    break
                else {
                    if (Date.now() - start >= timeout) {
                        return { conditionIsMet : false, result : undefined, exception : undefined }
                    }

                    await delay(interval)
                }

            } while (!result)

            return { conditionIsMet : true, result, exception : undefined }
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------

// experiment - separate class per assertion

// we use the final class as Mixin class, (even that a simple plain class would be enough)
// for the purpose of declaration files generation

@serializable({ id : 'AssertionWaitFor' })
export class AssertionWaitFor extends Mixin(
    [ AssertionAsyncCreation ],
    (base : ClassUnion<typeof AssertionAsyncCreation>) =>

    class AssertionWaitFor extends base {
        name            : string        = 'waitFor'

        get passed () : boolean {
            return this.resolution.passed
        }
    }
) {}
