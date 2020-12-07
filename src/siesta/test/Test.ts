import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger, LogLevel, LogMethod } from "../../logger/Logger.js"
import { Async } from "./assertion/Async.js"
import { TestLauncherChild } from "./channel/TestLauncher.js"
import { TestReporterChild } from "./channel/TestReporter.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { Assertion, AssertionAsyncCreation, AssertionAsyncResolution, LogMessage, TestNodeResult, TestResult } from "./Result.js"


//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [ TestNodeResult, Logger, Async ],
    (base : ClassUnion<typeof TestNodeResult, typeof Logger, typeof Async>) =>

    class Test extends base {
        // "upgrade" types from TreeNode
        parentNode          : Test

        code                : (t : this) => any     = t => {}

        // ongoing             : Promise<any>      = undefined

        pendingSubTests     : Test[]            = []

        reporter            : TestReporterChild     = undefined


        addResult (result : TestResult) : TestResult {
            super.addResult(result)

            if (!(result instanceof TestNodeResult)) this.reporter.onResult(this.localId, result)

            return result
        }


        addAsyncResolution (resolution : AssertionAsyncResolution) : AssertionAsyncResolution {
            super.addAsyncResolution(resolution)

            this.reporter.onAssertionFinish(this.localId, resolution)

            return resolution
        }


        printLogMessage (method : LogMethod, ...message) {
            this.addResult(LogMessage.new({
                level       : LogLevel[ method ],
                message     : [ ...message ].join(' ')
            }))
        }


        pass (description : string = '', annotation : string = '') {
            this.addResult(Assertion.new({
                name            : 'pass',
                passed          : true,
                description,
                annotation
            }))
        }


        fail (description : string = '', annotation : string = '') {
            this.addResult(Assertion.new({
                name            : 'fail',
                passed          : false,
                description,
                annotation
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


        it (name : TestDescriptorArgument, code : (t : this) => any) : this {
            const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

            const cls       = this.constructor as typeof Test

            const test      = cls.new({ descriptor, code, parentNode : this, reporter : this.reporter })

            this.pendingSubTests.push(test)

            return test as this
        }


        describe (name : TestDescriptorArgument, code : (t : this) => any) : this {
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


        // TODO should have timeout property
        async setup () {
        }


        async tearDown () {
        }


        static it<T extends typeof Test> (this : T, name : TestDescriptorArgument, code : (t : Test) => any) : InstanceType<T> {
            if (!globalTestEnv.topTest) {
                if (!globalTestEnv.topTestDescriptor) throw new Error("No top test descriptor")
                if (!globalTestEnv.launcher) throw new Error("No test launcher")

                globalTestEnv.topTest   = this.new({
                    descriptor      : globalTestEnv.topTestDescriptor,
                    // TS can't figure out types compatibility
                    reporter        : globalTestEnv.launcher as TestReporterChild
                } as Partial<InstanceType<T>>)
            }

            return globalTestEnv.topTest.it(name, code) as InstanceType<T>
        }


        static describe<T extends typeof Test> (this : T, name : TestDescriptorArgument, code : (t : Test) => any) : InstanceType<T> {
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
export const it = (name : TestDescriptorArgument, code : (t : Test) => any) : Test => {
    return Test.it(name, code)
}

export const describe = it
