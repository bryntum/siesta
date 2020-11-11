import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { isSubclassOf, isSuperclassOf } from "../../util/Helpers.js"
import { Agent } from "../agent/Agent.js"
import { Assertion, TestNodeResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends Test>(t : T) => any

export class TestDescriptor extends Base {
    name            : string                = ''

    testClass       : typeof Test           = Test

    env             : 'generic' | 'browser' | 'nodejs'  = 'generic'

    tags            : string[]              = []


    merge (anotherObj : Partial<TestDescriptor>) {
        const another   = (this.constructor as typeof TestDescriptor).maybeNew(anotherObj)

        if (this.name) {
            if (another.name !== this.name) throw new Error('Can not merge test descriptor - `name` does not match')
        } else {
            this.name       = another.name
        }

        // TODO can promote `env` from `generic` to either `browser` or `nodejs`, anything else should throw

        if (isSuperclassOf(another.testClass, this.testClass)) {
            this.testClass      = another.testClass
        }
        else if (another.testClass === this.testClass || isSubclassOf(another.testClass, this.testClass)) {
            // do nothing
        }
        else
            throw new Error("Can not merge descriptor - different `testClass` hierarchies")

        // strip duplicates
        this.tags           = Array.from(new Set(this.tags.concat(another.tags)))
    }


    static fromTestDescriptorArgument<T extends typeof TestDescriptor> (this : T, props? : string | Partial<InstanceType<T>>) : InstanceType<T> {
        if (typeof props === 'string' || (props instanceof String)) {
            // @ts-ignore
            return this.new({ name : props })
        } else {
            return this.new(props)
        }
    }
}

export type TestDescriptorArgument = string | Partial<TestDescriptor>


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
        url             : string            = ''

        agent           : Agent             = undefined

        context         : ExecutionContext  = undefined


        async setup () {

        }


        async tearDown () {

        }
    }
) {}
