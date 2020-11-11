import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { LocalContextProvider } from "../context_provider/LocalContextProvider.js"
import { TestDescriptorArgument } from "./Descriptor.js"
import { Assertion, TestNodeResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends Test>(t : T) => any


//---------------------------------------------------------------------------------------------------------------------
export class SubTest extends Mixin(
    [ TestNodeResult, Base ],
    (base : ClassUnion<typeof TestNodeResult, typeof Base>) =>

    class SubTest extends base {
        // "promote" types from TreeNode
        parentNode      : SubTest
        childNodes      : SubTest[]

        code            : TestCode          = undefined

        ongoing         : Promise<any>      = undefined


        $rootTest       : Test              = undefined

        get rootTest () : Test {
            if (this.$rootTest !== undefined) return this.$rootTest

            return this.$rootTest = this.getRootNode() as Test
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
    [ SubTest ],
    (base : AnyConstructor<SubTest, ClassUnion<typeof SubTest>>) =>

    class Test extends base {
        url             : string            = ''

        agent           : LocalContextProvider             = undefined

        context         : ExecutionContext  = undefined


        async setup () {

        }


        async tearDown () {

        }
    }
) {}


const it = () => {

}
