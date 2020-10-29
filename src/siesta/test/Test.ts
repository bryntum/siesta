import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { Agent } from "../agent/Agent.js"
import { Assertion, TestNodeResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends Test>(t : T) => any

export type TestDescriptor = {
    name?           : string

    testClass?      : typeof Test

    env?            : 'generic' | 'browser' | 'nodejs'

    tags?           : string[]
}

export type TestDescriptorArgument = string | TestDescriptor


//---------------------------------------------------------------------------------------------------------------------
export class TestNode extends Mixin(
    [ TestNodeResult, Base ],
    (base : ClassUnion<typeof TestNodeResult, typeof Base>) =>

    class TestNode extends base {
        // "promote" types from TreeNode
        parentNode      : TestNode
        childNodes      : TestNode[]

        code            : TestCode          = undefined

        ongoing         : Promise<any>      = undefined


        $rootTest   : Test                  = undefined

        get rootTest () : Test {
            if (this.$rootTest !== undefined) return this.$rootTest

            return this.$rootTest = this.getRootNode() as Test
        }


        addAssertion (assertion : Assertion) {
            this.assertions.push(assertion)
        }


        pass (description : string = '', annotation : string = '') {
            this.addAssertion(Assertion.new({
                passed          : true,
                description,
                annotation
            }))
        }


        fail (description : string = '', annotation : string = '') {
            this.addAssertion(Assertion.new({
                passed          : false,
                description,
                annotation
            }))
        }


        ok<V> (value : V, description : string = '') {
            this.addAssertion(Assertion.new({
                passed          : Boolean(value),
                description
            }))
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            this.addAssertion(Assertion.new({
                passed          : value1 === value2,
                description
            }))
        }


        it<T extends typeof Test> (name : TestDescriptorArgument, code : TestCode) : any {

        }


        describe<T extends typeof Test> (name : TestDescriptorArgument, code : TestCode) : any {
            return this.it(name, code)
        }


        async start () {

        }


        async launch () {
            this.rootTest.context.attach()
        }
    }
) {}


export class Test extends Mixin(
    [ TestNode ],
    (base : AnyConstructor<TestNode, ClassUnion<typeof TestNode>>) =>

    class Test extends base {

        agent           : Agent             = undefined

        context         : ExecutionContext  = undefined


        async setup () {

        }


        async tearDown () {

        }
    }
){}
