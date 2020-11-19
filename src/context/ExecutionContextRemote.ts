import { Channel, local, remote } from "../channel/Channel.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContext } from "./ExecutionContext.js"

//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextRemote extends Mixin(
    [ Channel, ExecutionContext ],
    (base : ClassUnion<typeof Channel, typeof ExecutionContext>) => {

        class ExecutionContextRemote extends base {

            @remote()
            evaluateFunction : (functionSource : string, args : unknown[]) => Promise<unknown>


            async evaluate <A extends unknown[], R extends unknown> (func : (...args : A) => R | Promise<R>, ...args : A) : Promise<R> {
                return await this.evaluateFunction(func.toString(), args) as R
            }


            async setup () {
                await this.connect()
            }


            async destroy () {
                await this.disconnect()
            }
        }

        return ExecutionContextRemote
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextRemoteChild extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) => {

        class ExecutionContextRemoteChild extends base {

            @local()
            async evaluateFunction (functionSource : string, args : unknown[]) : Promise<unknown> {
                const func      = globalThis.eval('(' + functionSource + ')')

                return await func(...args)
            }


            async setup () {
                await this.connect()
            }


            async destroy () {
                await this.disconnect()
            }
        }

        return ExecutionContextRemoteChild
    }
) {}

