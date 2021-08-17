import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
export class UserAgent extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class UserAgent extends base {
    }
) {}
