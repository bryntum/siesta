import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { serializable } from "../../../serializable/Serializable.js"
import { delay, OrPromise } from "../../../util/Helpers.js"
import { isFunction } from "../../../util/Typeguards.js"
import { AssertionAsyncCreation, AssertionAsyncResolution, Exception, TestNodeResult } from "../TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * An argument for the `waitFor` test class method, denoting the "waiting"
 */
type WaitForArg<R> = {
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
export class AssertionAsync extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionAsync extends base {

        get defaultTimeout () : number {
            return this.descriptor.defaultTimeout
        }

        get waitForTimeout () : number {
            return this.descriptor.waitForTimeout
        }
        get waitForPollInterval () : number {
            return this.descriptor.waitForPollInterval
        }


        beginAsync () {
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

@serializable()
export class AssertionWaitFor extends AssertionAsyncCreation {
    name            : string        = 'waitFor'


    get passed () : boolean {
        return this.resolution.passed
    }
}
