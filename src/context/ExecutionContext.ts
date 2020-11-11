import { Base } from "../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../class/Mixin.js"
import { Hook } from "../event/Hook.js"


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContext extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class ExecutionContext extends base {
        attachedTo  : any       = undefined


        attach () {

        }


        detach () {

        }


        async evaluate <A extends unknown[], R extends unknown> (func : (...args : A) => R | Promise<R>, ...args : A) : Promise<R> {
            throw new Error("Abstract method")
        }


        exceptionHook : Hook<[ this, unknown ]>     = undefined
        rejectionHook : Hook<[ this, unknown ]>     = undefined
    }
) {}
