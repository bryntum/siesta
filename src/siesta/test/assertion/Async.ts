import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { registerSerializableClass } from "../../../serializable/Serializable.js"
import { delay, OrPromise } from "../../../util/Helpers.js"
import { isFunction } from "../../../util/Typeguards.js"
import { AssertionAsyncCreation, AssertionAsyncResolution, Exception, TestNodeResult } from "../Result.js"


//---------------------------------------------------------------------------------------------------------------------
type WaitForArg<R> = (() => OrPromise<R>) | {
    condition       : () => OrPromise<R>,
    timeout?        : number,
    interval?       : number,
    description?    : string
}


//---------------------------------------------------------------------------------------------------------------------
export class Async extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class Async extends base {

        defaultTimeout      : number        = 15000

        waitForTimeout      : number        = undefined
        waitForPollInterval : number        = 100


        beginAsync () {

        }


        keepAlive <R> (during : Promise<R>) : Promise<R> {


            return during
        }


        async waitFor <R> (arg : WaitForArg<R>, description? : string) : Promise<R> {
            let condition : () => OrPromise<R>
            let timeout : number    = this.waitForTimeout || this.defaultTimeout
            let desc : string       = description
            let pollInterval        = this.waitForPollInterval

            if (isFunction(arg)) {
                condition           = arg
            } else {
                condition           = arg.condition
                timeout             = arg.timeout ?? timeout
                desc                = arg.description
                pollInterval        = arg.interval ?? pollInterval
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

                await delay(interval)

                if (Date.now() - start >= timeout) {
                    return { conditionIsMet : false, result : undefined, exception : undefined }
                }
            } while (!result)

            return { conditionIsMet : true, result, exception : undefined }
        }

    }
) {}


//---------------------------------------------------------------------------------------------------------------------

// experiment - separate class per assertion

export class AssertionWaitFor extends AssertionAsyncCreation {
    name            : string        = 'waitFor'


    get passed () : boolean {
        return this.resolution.passed
    }
}

registerSerializableClass('AssertionWaitFor', AssertionWaitFor)
