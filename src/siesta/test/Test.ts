import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { Logger, LogLevel, LogMethod } from "../../logger/Logger.js"
import { AssertionAsync } from "./assertion/AssertionAsync.js"
import { AssertionCompare } from "./assertion/AssertionCompare.js"
import { AssertionException } from "./assertion/AssertionException.js"
import { AssertionGeneral } from "./assertion/AssertionGeneral.js"
import { Expectation } from "./Expectation.js"
import { TestLauncherChild } from "./port/TestLauncher.js"
import { TestReporterChild } from "./port/TestReporter.js"
import { TestDescriptor, TestDescriptorArgument } from "./TestDescriptor.js"
import { Assertion, AssertionAsyncResolution, Exception, LogMessage, TestNodeResult, TestResult } from "./TestResult.js"


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

        pendingSubTests     : Test[]                = []

        reporter            : TestReporterChild     = undefined

        beforeEachHooks     : ((t : this) => any)[] = []
        afterEachHooks      : ((t : this) => any)[] = []

        isExclusive         : boolean               = false

        // not related to `before/afterEach` hooks, completely different thing
        preStartHook           : Hook<[ this ]>     = new Hook()
        startHook           : Hook<[ this ]>        = new Hook()

        finishHook          : Hook<[ this ]>        = new Hook()
        postFinishHook      : Hook<[ this ]>        = new Hook()


        expect (value : unknown) : Expectation {
            return Expectation.new({ value, t : this })
        }


        beforeEach (code : (t : this) => any) {
            this.beforeEachHooks.push(code)
        }


        afterEach (code : (t : this) => any) {
            this.afterEachHooks.push(code)
        }


        addResult (result : TestResult) : TestResult {
            if ((result instanceof Assertion) && result.sourceLine === undefined) result.sourceLine = this.getSourceLine()

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
                description
            }))
        }


        fail (description : string = '') {
            this.addResult(Assertion.new({
                name            : 'fail',
                passed          : false,
                description
            }))
        }


        todo (name : TestDescriptorArgument, code : (t : this) => any) : this {
            const test              = this.it(name, code)

            test.descriptor.isTodo  = true

            return test
        }


        xit (name : TestDescriptorArgument, code : (t : this) => any) : this {
            const cls       = this.constructor as typeof Test

            const test      = cls.new()

            // return a dummy test instance to keep the possibly dependent code happy
            return test as this
        }


        iit (name : TestDescriptorArgument, code : (t : this) => any) : this {
            const test          = this.it(name, code)

            test.isExclusive    = true

            return test
        }


        it (name : TestDescriptorArgument, code : (t : this) => any) : this {
            const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

            if (this.isTodo) descriptor.isTodo  = true

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
            // extra-early start hook, test is not yet marked as active in the reporter
            this.preStartHook.trigger(this)

            globalTestEnv.currentTest       = this

            this.reporter.onSubTestStart(this.localId, this.parentNode ? this.parentNode.localId : null, this.descriptor)

            // start hook, test is marked as active in the reporter
            this.startHook.trigger(this)

            if (this.isRoot) await this.setup()

            await this.launch()

            if (this.isRoot) await this.tearDown()

            // finish hook, test is still marked as active in the reporter
            this.finishHook.trigger(this)

            this.reporter.onSubTestFinish(this.localId)

            globalTestEnv.currentTest       = this.parentNode

            // extra-late finish hook, test is already not marked as active in the reporter
            this.postFinishHook.trigger(this)
        }


        // TODO
        // need to figure out if we need to wait until all reports (`this.reporter.onXXX`)
        // has been completed or not, before completing the method
        async launch () {
            const beforeHooks   = this.collectParents(true).flatMap(parent => parent.beforeEachHooks)
            const afterHooks    = this.collectParents().flatMap(parent => parent.afterEachHooks)

            for (const hook of beforeHooks) await hook(this)

            try {
                await this.code(this)
            } catch (exception) {
                // console.log("TEST EXCEPTION", exception, "STACK", exception.stack)

                this.addResult(Exception.new({ exception }))
            }

            const exclusiveSubTests = this.pendingSubTests.filter(subTest => subTest.isExclusive)
            const subTestsToLaunch  = exclusiveSubTests.length > 0 ? exclusiveSubTests : this.pendingSubTests

            while (subTestsToLaunch.length) {
                const subTest       = subTestsToLaunch.shift()

                this.addResult(subTest)

                await subTest.start()
            }

            for (const hook of afterHooks) await hook(this)
        }


        // TODO should have timeout property
        async setup () {
        }


        async tearDown () {
        }


        static iit<T extends typeof Test> (this : T, name : TestDescriptorArgument, code : (t : Test) => any) : InstanceType<T> {
            const test          = this.it(name, code)

            test.isExclusive    = true

            return test
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

            const currentTest       = globalTestEnv.currentTest || globalTestEnv.topTest

            return currentTest.it(name, code) as InstanceType<T>
        }


        static describe<T extends typeof Test> (this : T, name : TestDescriptorArgument, code : (t : Test) => any) : InstanceType<T> {
            return this.it(name, code)
        }


        static ddescribe<T extends typeof Test> (this : T, name : TestDescriptorArgument, code : (t : Test) => any) : InstanceType<T> {
            return this.iit(name, code)
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class GlobalTestEnvironment extends Base {
    launcher            : TestLauncherChild = undefined

    // the test instance, representing the whole current test file
    // not directly accessible by user, but every global `it/describe` section
    // is created as child node of it
    topTest             : Test              = undefined

    topTestDescriptor   : TestDescriptor    = undefined

    currentTest         : Test              = undefined


    clear () {
        this.launcher           = undefined
        this.topTest            = undefined
        this.topTestDescriptor  = undefined
        this.currentTest        = undefined
    }
}

export const globalTestEnv : GlobalTestEnvironment = GlobalTestEnvironment.new()


//---------------------------------------------------------------------------------------------------------------------
export const it = (name : TestDescriptorArgument, code : (t : Test) => any) : Test => {
    return Test.it(name, code)
}

export const describe = it


export const iit = (name : TestDescriptorArgument, code : (t : Test) => any) : Test => {
    return Test.iit(name, code)
}

export const ddescribe = iit


export const xit = (name : TestDescriptorArgument, code : (t : Test) => any) : Test => {
    return Test.new()
}

export const xdescribe = xit


//---------------------------------------------------------------------------------------------------------------------
export const beforeEach = (code : (t : Test) => any) => {
    if (!globalTestEnv.currentTest) throw new Error("Global `beforeEach` call used outside of the scope of any test")

    globalTestEnv.currentTest.beforeEach(code)
}

export const afterEach = (code : (t : Test) => any) => {
    if (!globalTestEnv.currentTest) throw new Error("Global `afterEach` call used outside of the scope of any test")

    globalTestEnv.currentTest.afterEach(code)
}

//---------------------------------------------------------------------------------------------------------------------
export const expect = (value : unknown) : Expectation => {
    if (!globalTestEnv.currentTest) throw new Error("Global `expect` call used outside of the scope of any test")

    return Expectation.new({ value, t : globalTestEnv.currentTest })
}
