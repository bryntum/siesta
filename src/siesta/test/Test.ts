import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TreeNode } from "../../tree/ChildNode.js"
import { Assertion } from "./Assertion.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends Test>(t : T) => Promise<T>

//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ TreeNode ],
    (base : AnyConstructor<TreeNode, typeof TreeNode>) =>

    class Test extends base {
        assertions      : Assertion[]       = []


        ok<V> (value : V, description : string = '') {

        }


        is<V> (value1 : V, value2 : V, description : string = '') {

        }


        it (name : string, code : TestCode) {

        }


        describe (name : string, code : TestCode) {
            return this.it(name, code)
        }
    }
) {}
