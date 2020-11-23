import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isNodejs } from "../../util/Helpers.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { ChannelTestReporter } from "./ReporterChannel.js"
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

        reporter            : ChannelTestReporter              = undefined


        addAssertion (assertion : Assertion) {
            super.addAssertion(assertion)

            this.reporter.onAssertion(this.id, assertion)
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

            this.parentNode.pendingSubTests.push(test)
        }


        describe (name : TestDescriptorArgument, code : TestCode) : any {
            return this.it(name, code)
        }


        async start () {
            this.reporter.onSubTestStart(this)

            await this.launch()

            this.reporter.onSubTestFinish(this.descriptor.filename)
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
        // agent           : LocalContextProvider              = undefined
        //
        // context         : ExecutionContext                  = undefined

        reporter            : ChannelTestReporter              = ChannelTestReporter.new()


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
export class TestEnvironmentContext extends Base {
    $topTest     : Test              = undefined


    get topTest () : Test {
        if (this.$topTest !== undefined) return this.$topTest

        return
    }

    set topTest (value : Test) {
        this.$topTest = value
    }


    initialize<T extends Base> (props? : Partial<T>) {
        super.initialize(props)

        if (isNodejs()) {
            const processFilename       = process.argv[ 1 ]

            if (/\.t\.js$/.test(processFilename)) {
                this.launchStandaloneNodejsTest()
            }
        }
    }


    buildTopTest () : Test {
        if (isNodejs()) {
            const processFilename       = process.argv[ 1 ]

            const topTest           = this.topTest = Test.new({
                descriptor      : TestDescriptor.new({ filename : processFilename })
            })

            return topTest
        }
    }


    async launchStandaloneNodejsTest () {
        await Promise.resolve()

        this.topTest.start()
    }
}

export const globalTestEnv : TestEnvironmentContext = TestEnvironmentContext.new()


//---------------------------------------------------------------------------------------------------------------------
export const it = (name : TestDescriptorArgument, code : TestCode) => {
    globalTestEnv.topTest.it(name, code)
}

export const describe = it
