import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger, LogLevel, LogMethod } from "../../logger/Logger.js"
import { TestLauncherChild } from "./channel/TestLauncher.js"
import { TestReporterChild } from "./channel/TestReporter.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { Assertion, LogMessage, TestNodeResult, TestResult } from "./Result.js"

//---------------------------------------------------------------------------------------------------------------------
export type TestCode = <T extends Test>(t : T) => any



//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ TestNodeResult, Logger ],
    (base : ClassUnion<typeof TestNodeResult, typeof Logger>) =>

    class Test extends base {
        // "upgrade" types from TreeNode
        parentNode          : Test

        code                : TestCode          = (t : Test) => {}

        // ongoing             : Promise<any>      = undefined

        pendingSubTests     : Test[]         = []

        reporter            : TestReporterChild = undefined


        addResult (result : TestResult) {
            super.addResult(result)

            if (!(result instanceof TestNodeResult)) this.reporter.onResult(this.localId, result)
        }


        printLogMessage (method : LogMethod, ...message) {
            this.addResult(LogMessage.new({
                level       : LogLevel[ method ],
                message     : [ ...message ].join(' ')
            }))
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

            const test      = Test.new({ descriptor, code, parentNode : this, reporter : this.reporter })

            this.pendingSubTests.push(test)
        }


        describe (name : TestDescriptorArgument, code : TestCode) : any {
            return this.it(name, code)
        }


        async start () {
            this.reporter.onSubTestStart(this.localId, this.parentNode ? this.parentNode.localId : null, this.descriptor)

            if (this.isRoot) await this.setup()

            await this.launch()

            if (this.isRoot) await this.tearDown()

            this.reporter.onSubTestFinish(this.localId)
        }


        async launch () {
            await this.code(this)

            while (this.pendingSubTests.length) {
                const subTest       = this.pendingSubTests.shift()

                this.addResult(subTest)

                await subTest.start()
            }
        }


        async setup () {
        }


        async tearDown () {
        }


        static it (name : TestDescriptorArgument, code : TestCode) {
            if (!globalTestEnv.topTest) {
                if (!globalTestEnv.topTestDescriptor) throw new Error("No top test descriptor")
                if (!globalTestEnv.launcher) throw new Error("No test launcher")

                globalTestEnv.topTest   = this.new({
                    descriptor      : globalTestEnv.topTestDescriptor,

                    reporter        : globalTestEnv.launcher
                })
            }

            globalTestEnv.topTest.it(name, code)
        }


        static describe (name : TestDescriptorArgument, code : TestCode) {
            return this.it(name, code)
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class GlobalTestEnvironment extends Base {
    launcher            : TestLauncherChild = undefined

    topTest             : Test              = undefined

    topTestDescriptor   : TestDescriptor    = undefined


    clear () {
        this.launcher           = undefined
        this.topTest            = undefined
        this.topTestDescriptor  = undefined
    }
}

export const globalTestEnv : GlobalTestEnvironment = GlobalTestEnvironment.new()


//---------------------------------------------------------------------------------------------------------------------
export const it = (name : TestDescriptorArgument, code : TestCode) => {
    return Test.it(name, code)
}

export const describe = it
