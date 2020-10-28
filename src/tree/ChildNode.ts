import { AnyConstructor, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class TreeNode extends Mixin(
    [],
    (base : AnyConstructor) =>

    class TreeNode extends base {
        parentNode      : TreeNode          = undefined
        childNodes      : TreeNode[]        = []
    }
) {}
