import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Dispatcher extends base {
    }
) {}
