import { Channel, local, remote } from "./Channel.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
interface ChannelEvaluate {
    doEvaluate (functionSource : string, args : unknown[]) : Promise<unknown>
}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelEvaluateParent extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) => {

        class ChannelEvaluateParent extends base implements ChannelEvaluate {

            @remote()
            doEvaluate : (functionSource : string, args : unknown[]) => Promise<unknown>


            async evaluate <A extends unknown[], R extends unknown> (func : (...args : A) => R | Promise<R>, ...args : A) : Promise<R> {
                return await this.doEvaluate(func.toString(), args) as R
            }
        }

        return ChannelEvaluateParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelEvaluateChild extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) => {

        class ChannelEvaluateChild extends base implements ChannelEvaluate {

            @local()
            async doEvaluate (functionSource : string, args : unknown[]) : Promise<unknown> {
                const func      = globalThis.eval('(' + functionSource + ')')

                return await func(...args)
            }
        }

        return ChannelEvaluateChild
    }
) {}

