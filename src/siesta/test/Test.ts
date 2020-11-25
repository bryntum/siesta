import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestReporterChild } from "./channel/TestReporter.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { Assertion, TestNodeResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends SubTest>(t : T) => any


//---------------------------------------------------------------------------------------------------------------------
export class SubTest extends Mixin(
    [ TestNodeResult/*, TestDescriptor*/ ],
    (base : ClassUnion<typeof TestNodeResult/*, typeof TestDescriptor*/>) =>

    class SubTest extends base {
        // "upgrade" types from TreeNode
        parentNode          : SubTest
        childNodes          : SubTest[]

        code                : TestCode          = (t : SubTest) => {}

        ongoing             : Promise<any>      = undefined

        descriptor          : TestDescriptor    = undefined

        pendingSubTests     : SubTest[]         = []

        reporter            : TestReporterChild = undefined


        addAssertion (assertion : Assertion) {
            super.addAssertion(assertion)

            this.reporter.onAssertion(/*this.id, */assertion)
        }


        $rootTest       : Test              = undefined

        get rootTest () : Test {
            if (this.$rootTest !== undefined) return this.$rootTest

            return this.$rootTest = this.getRootNode() as Test
        }


        ok<V> (value : V, description : string = '') {
            this.addAssertion(Assertion.new({
                name            : 'ok',
                passed          : Boolean(value),
                description
            }))
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            this.addAssertion(Assertion.new({
                name            : 'is',
                passed          : value1 === value2,
                description
            }))
        }


        it (name : TestDescriptorArgument, code : TestCode) : any {
            const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

            const test      = SubTest.new({ descriptor, code, parentNode : this, reporter : this.reporter })

            this.pendingSubTests.push(test)
        }


        describe (name : TestDescriptorArgument, code : TestCode) : any {
            return this.it(name, code)
        }


        async start () {
            this.reporter.onSubTestStart(/*this*/)

            await this.launch()

            this.reporter.onSubTestFinish(/*this.descriptor.filename*/)
        }


        async launch () {
            await this.code(this)

            while (this.pendingSubTests.length) {
                const subTest       = this.pendingSubTests.shift()

                this.childNodes.push(subTest)

                await subTest.start()
            }
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ SubTest ],
    (base : ClassUnion<typeof SubTest>) =>

    class Test extends base {
        reporter            : TestReporterChild              = undefined


        async start () {
            await this.setup()

            await super.start()

            await this.tearDown()
        }


        async setup () {

        }


        async tearDown () {

        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class GlobalTestEnvironment extends Base {
    topTest             : Test              = undefined
}

export const globalTestEnv : GlobalTestEnvironment = GlobalTestEnvironment.new()


//---------------------------------------------------------------------------------------------------------------------
export const it = (name : TestDescriptorArgument, code : TestCode) => {
    if (!globalTestEnv.topTest) throw new Error("No global test instance")

    globalTestEnv.topTest.it(name, code)
}

export const describe = it
