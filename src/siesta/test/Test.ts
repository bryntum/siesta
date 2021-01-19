import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger, LogLevel, LogMethod } from "../../logger/Logger.js"
import { AssertionAsync } from "./assertion/AssertionAsync.js"
import { AssertionCompare } from "./assertion/AssertionCompare.js"
import { AssertionException } from "./assertion/AssertionException.js"
import { AssertionGeneral } from "./assertion/AssertionGeneral.js"
import { TestLauncherChild } from "./port/TestLauncher.js"
import { TestReporterChild } from "./port/TestReporter.js"
import { TestDescriptor, TestDescriptorArgument } from "./Descriptor.js"
import { Assertion, AssertionAsyncResolution, Exception, LogMessage, TestNodeResult, TestResult } from "./Result.js"


//---------------------------------------------------------------------------------------------------------------------
export class Test extends Mixin(
    [
        TestNodeResult,
        Logger,
        AssertionAsync,
        AssertionCompare,
        AssertionException,
        AssertionGeneral
    ],
    (base : ClassUnion<
        typeof TestNodeResult,
        typeof Logger,
        typeof AssertionAsync,
        typeof AssertionCompare,
        typeof AssertionException,
        typeof AssertionGeneral
    >) =>

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


        pass (description : string = '') {
            this.addResult(Assertion.new({
                name            : 'pass',
                passed          : true,
                sourceLine      : this.getSourceLine(),
                description
            }))
        }


        fail (description : string = '') {
            this.addResult(Assertion.new({
                name            : 'fail',
                passed          : false,
                sourceLine      : this.getSourceLine(),
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


        failOnExceptionDuringImport (exception : unknown) {
            this.reporter.onSubTestStart(this.localId, this.parentNode ? this.parentNode.localId : null, this.descriptor)

            this.addResult(Exception.new({ exception }))

            this.reporter.onSubTestFinish(this.localId)
        }


        async start () {
            this.reporter.onSubTestStart(this.localId, this.parentNode ? this.parentNode.localId : null, this.descriptor)

            if (this.isRoot) await this.setup()

            await this.launch()

            if (this.isRoot) await this.tearDown()

            this.reporter.onSubTestFinish(this.localId)
        }


        // TODO
        // need to figure out if we need to wait until all reports (`this.reporter.onXXX`)
        // has been completed or not, before completing the method
        async launch () {
            try {
                await this.code(this)
            } catch (exception) {
                // console.log("TEST EXCEPTION", exception, "STACK", exception.stack)

                this.addResult(Exception.new({ exception }))
            }

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
