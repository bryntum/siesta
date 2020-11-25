import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestReporterChild } from "./channel/TestReporter.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { nextInternalId } from "./InternalIdSource.js"
import { Assertion, Result, TestNodeResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends SubTest>(t : T) => any



//---------------------------------------------------------------------------------------------------------------------
export class SubTest extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class SubTest extends base {
        // "upgrade" types from TreeNode
        parentNode          : SubTest
        childNodes          : SubTest[]

        code                : TestCode          = (t : SubTest) => {}

        ongoing             : Promise<any>      = undefined

        pendingSubTests     : SubTest[]         = []

        reporter            : TestReporterChild = undefined


        addResult (result : Result) {
            super.addResult(result)

            this.reporter.onResult(this.internalId, result)
        }


        $rootTest       : Test              = undefined

        get rootTest () : Test {
            if (this.$rootTest !== undefined) return this.$rootTest

            return this.$rootTest = this.getRootNode() as Test
        }


        ok<V> (value : V, description : string = '') {
            this.addResult(Assertion.new({
                name            : 'ok',
                passed          : Boolean(value),
                description
            }))
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            this.addResult(Assertion.new({
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
            this.reporter.onSubTestStart(this.internalId, this.parentNode ? this.parentNode.internalId : null, this.descriptor)

            await this.launch()

            this.reporter.onSubTestFinish(this.internalId)
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
