import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TreeNode } from "../../tree/ChildNode.js"
import { Agent } from "../agent/Agent.js"
import { Assertion } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends Test>(t : T) => any

export type TestDescriptor<T extends typeof Test> = string | {
    name            : string

    testClass?      : T

    env?            : 'generic' | 'browser' | 'nodejs'

    tags            : string[]
}

//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ TreeNode, Base ],
    (base : AnyConstructor<TreeNode & Base, typeof TreeNode & typeof Base>) =>

    class Test extends base {
        assertions      : Assertion[]       = []

        agent           : Agent             = undefined

        isTodo          : boolean           = false


        ok<V> (value : V, description : string = '') {

        }


        is<V> (value1 : V, value2 : V, description : string = '') {

        }


        it<T extends typeof Test> (name : TestDescriptor<T>, code : TestCode) : any {

        }


        describe<T extends typeof Test> (name : TestDescriptor<T>, code : TestCode) : any {
            return this.it(name, code)
        }


        async start () {

        }


        async launch () {

        }


        async setup () {

        }


        async tearDown () {

        }
    }
) {}
