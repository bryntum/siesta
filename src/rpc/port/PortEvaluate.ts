import { Port, local, remote } from "./Port.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
interface PortEvaluate {
    doEvaluate (functionSource : string, args : unknown[]) : Promise<unknown>
}


//---------------------------------------------------------------------------------------------------------------------
export class PortEvaluateParent extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class PortEvaluateParent extends base implements PortEvaluate {

            @remote()
            doEvaluate : (functionSource : string, args : unknown[]) => Promise<unknown>


            async evaluate <A extends unknown[], R extends unknown> (func : (...args : A) => R | Promise<R>, ...args : A) : Promise<R> {
                return await this.doEvaluate(func.toString(), args) as R
            }
        }

        return PortEvaluateParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class PortEvaluateChild extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class PortEvaluateChild extends base implements PortEvaluate {

            @local()
            async doEvaluate (functionSource : string, args : unknown[]) : Promise<unknown> {
                const func      = globalThis.eval('(' + functionSource + ')')

                return await func(...args)
            }
        }

        return PortEvaluateChild
    }
) {}

