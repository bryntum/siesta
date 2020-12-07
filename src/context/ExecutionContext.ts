import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContext extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class ExecutionContext extends base {
        // TODO the idea was to abstract the handling of "unhandled" exceptions/rejections
        // however it went to `ExecutionContextRemote`
        
        // attachedTo  : any       = undefined
        //
        //
        // attach () {
        //
        // }
        //
        //
        // detach () {
        //
        // }
        // exceptionHook : Hook<[ this, unknown ]>     = undefined
        // rejectionHook : Hook<[ this, unknown ]>     = undefined


        async evaluate <A extends unknown[], R extends unknown> (func : (...args : A) => R | Promise<R>, ...args : A) : Promise<R> {
            throw new Error("Abstract method")
        }



        async setup () {
            throw new Error("Abstract method")
        }


        async destroy () {
            throw new Error("Abstract method")
        }
    }
) {}
