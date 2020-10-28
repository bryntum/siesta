import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { TreeNode } from "../tree/ChildNode.js"
import { Assertion } from "./Assertion.js"

//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ TreeNode ],
    (base : AnyConstructor<TreeNode, typeof TreeNode>) =>

    class Test extends base {
        assertions      : Assertion[]       = []




    }
) {}
