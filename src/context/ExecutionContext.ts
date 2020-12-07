import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContext extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class ExecutionContext extends base {
        // TODO the idea is to abstract the handling of "unhandled" exceptions/rejections

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
    }
) {}
