import { Base } from "../class/Base.js"
import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { Hook } from "../event/Hook.js"


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContext extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class ExecutionContext extends base {
        attachedTo  : any       = undefined


        attach () {

        }


        detach () {

        }


        exceptionHook : Hook<[ this ]>       = new Hook()
        rejectionHook : Hook<[ this ]>       = new Hook()
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextNodejs extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class ExecutionContextNodejs extends base {
    }
) {}

