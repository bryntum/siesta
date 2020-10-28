import { Base } from "../class/Base.js"
import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { TreeNode } from "../tree/ChildNode.js"

//---------------------------------------------------------------------------------------------------------------------
export class Assertion extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Assertion extends base {
        name            : string            = ''



    }
) {}
