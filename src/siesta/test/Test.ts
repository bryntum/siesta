import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isNodejs } from "../../util/Helpers.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { Assertion, TestNodeResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends SubTest>(t : T) => any


//---------------------------------------------------------------------------------------------------------------------
export class SubTest extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class SubTest extends base {
        // "upgrade" types from TreeNode
        parentNode      : SubTest
        childNodes      : SubTest[]

        code            : TestCode          = undefined


        ongoing         : Promise<any>      = undefined


        descriptor      : TestDescriptor    = undefined


        pendingSubTests : SubTest[]         = []


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
            const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

            const test      = SubTest.new({ descriptor, code })

            this.parentNode.pendingSubTests.push(test)
        }


        describe<T extends typeof Test> (name : TestDescriptorArgument, code : TestCode) : any {
            return this.it(name, code)
        }


        async start () {
            console.log("START SUB TEST")

            await this.launch()

        }


        async launch () {
            this.code(this)
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ SubTest ],
    (base : ClassUnion<typeof SubTest>) =>

    class Test extends base {
        // agent           : LocalContextProvider              = undefined
        //
        // context         : ExecutionContext                  = undefined


        async start () {
            console.log("START TOP TEST")

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
export class TestEnvironmentContext extends Base {
    tests       : SubTest[]         = []


    initialize<T extends Base> (props? : Partial<T>) {
        super.initialize(props)

        if (isNodejs()) {
            (async () => {
                const path                  = await import('path')
                const processFilename       = process.argv[ 1 ]

                if (/\.t\.js$/.test(processFilename)) {
                    const topTest           = Test.new({
                        descriptor      : TestDescriptor.new({ filename : path.basename(processFilename) }),
                        code            : () => {}
                    })

                    Promise.resolve().then(() => {
                        topTest.pendingSubTests = this.tests

                        topTest.start()
                    })
                }
            })()
        }
    }
}

export const globalTestEnv : TestEnvironmentContext = TestEnvironmentContext.new()


//---------------------------------------------------------------------------------------------------------------------
export const it = (name : TestDescriptorArgument, code : TestCode) => {
    const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

    const test      = SubTest.new({ descriptor, code })

    globalTestEnv.tests.push(test)

    console.log("YO")
}

export const describe = it
