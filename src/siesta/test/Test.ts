import { ChannelSameContext } from "../../rpc/channel/ChannelSameContext.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { Logger, LogLevel, LogMethod } from "../../logger/Logger.js"
import { ArbitraryObject, ArbitraryObjectKey, isNodejs, prototypeValue } from "../../util/Helpers.js"
import { Launch } from "../launcher/Launch.js"
import { Launcher, LauncherError } from "../launcher/Launcher.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { AssertionAsync } from "./assertion/AssertionAsync.js"
import { AssertionCompare } from "./assertion/AssertionCompare.js"
import { AssertionException } from "./assertion/AssertionException.js"
import { AssertionGeneral } from "./assertion/AssertionGeneral.js"
import { AssertionType } from "./assertion/AssertionType.js"
import { Expectation } from "./Expectation.js"
import { ChannelTestLauncher, TestLauncherChild } from "./port/TestLauncher.js"
import { TestReporterChild } from "./port/TestReporter.js"
import { Spy, SpyFunction } from "./Spy.js"
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
        AssertionGeneral,
        AssertionType
    ],
    (base : ClassUnion<
        typeof TestNodeResult,
        typeof Logger,
        typeof AssertionAsync,
        typeof AssertionCompare,
        typeof AssertionException,
        typeof AssertionGeneral,
        typeof AssertionType
    >) => {

    class Test extends base {
        // @prototypeValue(Launcher)
        launcherClass       : typeof Launcher

        @prototypeValue(TestDescriptor)
        testDescriptorClass : typeof TestDescriptor

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
        preStartHook        : Hook<[ this ]>        = new Hook()
        startHook           : Hook<[ this ]>        = new Hook()

        finishHook          : Hook<[ this ]>        = new Hook()
        postFinishHook      : Hook<[ this ]>        = new Hook()

        spies               : Spy[]                 = []


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
            if ((result instanceof Assertion) && result.sourcePoint === undefined) result.sourcePoint = this.getSourcePoint()

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


        todo (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
            const test              = this.it(name, code)

            test.descriptor.isTodo  = true

            return test
        }


        xit (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
            const cls       = this.constructor as typeof Test

            const test      = cls.new()

            // return a dummy test instance to keep the possibly dependent code happy
            return test as this
        }


        iit (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
            const test          = this.it(name, code)

            test.isExclusive    = true

            return test
        }


        it (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
            const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

            if (this.isTodo) descriptor.isTodo  = true

            const cls       = this.constructor as typeof Test

            const test      = cls.new({ descriptor, code, parentNode : this, reporter : this.reporter })

            this.pendingSubTests.push(test)

            return test as this
        }


        describe (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
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

            this.cleanup()
        }


        cleanup () {
            this.spies.forEach(spy => spy.remove())
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

                // TODO
                // supports the launching individual test file case
                // in that case the `reporter` appears already after
                // the test structure is defined
                subTest.reporter    = this.reporter

                await subTest.start()
            }

            for (const hook of afterHooks) await hook(this)
        }


        // TODO should have timeout property
        async setup () {
        }


        async tearDown () {
        }


        /**
         * This method installs a "spy" instead of normal function in some object. The "spy" is basically another function,
         * which tracks the calls to itself. With spies, one can verify that some function was called and that
         * it was called with certain arguments.
         *
         * By default, spy will call the original method and return a value from it. To enable different behavior, you can use one of these methods:
         *
         * - {@link Siesta.Test.BDD.Spy#returnValue returnValue} - return a specific value
         * - {@link Siesta.Test.BDD.Spy#callThrough callThrough} - call the original method and return a value from it
         * - {@link Siesta.Test.BDD.Spy#stub stub} - call the original method and return a value from it
         * - {@link Siesta.Test.BDD.Spy#callFake callFake} - call the provided function and return a value from it
         * - {@link Siesta.Test.BDD.Spy#throwError throwError} - throw a specific exception object
         *

        const spy = t.spyOn(obj, 'process')
        // or, if you need to call some method instead
        const spy = t.spyOn(obj, 'process').and.callFake(() => {
            // is called instead of `process` method
        })

        // call the method
        obj.process('fast', 1)

        t.expect(spy).toHaveBeenCalled();
        t.expect(spy).toHaveBeenCalledWith('fast', 1);

         *
         * See also {@link #createSpy}, {@link #createSpyObj}, {@link Siesta.Test.BDD.Expectation#toHaveBeenCalled toHaveBeenCalled},
         * {@link Siesta.Test.BDD.Expectation#toHaveBeenCalledWith toHaveBeenCalledWith}
         *
         * See also the {@link Siesta.Test.BDD.Spy} class for additional details.
         *
         * @param {Object} object An object which property is being spied
         * @param {String} propertyName A name of the property over which to install the spy.
         *
         * @return {Siesta.Test.BDD.Spy} spy Created spy instance
         */
        spyOn (object : unknown, propertyName : ArbitraryObjectKey) : Spy {
            if (!object) { throw new Error("Missing host object in `spyOn` call") }

            return Spy.new({
                name            : String(propertyName),

                t               : this,
                hostObject      : object,
                propertyName    : propertyName
            })
        }

        /**
         * This method create a standalone spy function, which tracks all calls to it. Tracking is done using the associated
         * spy instance, which is available as `and` property. One can use the {@link Siesta.Test.BDD.Spy} class API to
         * verify the calls to the spy function.
         *
         * Example:

    var spyFunc     = t.createSpy('onadd listener')

    myObservable.addEventListener('add', spyFunc)

    // do something that triggers the `add` event on the `myObservable`

    t.expect(spyFunc).toHaveBeenCalled()

    t.expect(spyFunc.calls.argsFor(1)).toEqual([ 'Arg1', 'Arg2' ])

         *
         * See also: {@link #spyOn}
         *
         * @param {String} [spyName='James Bond'] A name of the spy for debugging purposes
         *
         * @return {Function} Created function. The associated spy instance is assigned to it as the `and` property
         */
        createSpy (spyName : string) : Function & { spy : Spy } {
            return Spy.new({
                name            : spyName || 'James Bond',
                t               : this
            }).stub().processor
        }


        /**
         * This method creates an object, which properties are spy functions. Such object can later be used as a mockup.
         *
         * This method can be called with one argument only, which should be an array of properties.
         *
         * Example:

    var mockup      = t.createSpyObj('encoder-mockup', [ 'encode', 'decode' ])
    // or just
    var mockup      = t.createSpyObj([ 'encode', 'decode' ])

    mockup.encode('string')
    mockup.decode('string')

    t.expect(mockup.encode).toHaveBeenCalled()


         *
         * See also: {@link #createSpy}
         *
         * @param {String} spyName A name of the spy object. Can be omitted.
         * @param {Array[String]} properties An array of the property names. For each property name a spy function will be created.
         *
         * @return {Object} A mockup object
         */
        createSpyObj (properties : ArbitraryObjectKey[]) : ArbitraryObject<SpyFunction> {
            const obj           = {}

            properties.forEach(propertyName =>
                obj[ propertyName ] = this.createSpy(String(propertyName))
            )

            return obj
        }


        static iit<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
            const test          = this.it(name, code)

            test.isExclusive    = true

            return test
        }


        static xit<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
            return this.new()
        }


        static it<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
            if (!globalTestEnv.topTest) {

                if (globalTestEnv.topTestDescriptor) {
                    // launched from the outside, by the Launcher
                    globalTestEnv.topTest   = this.new({
                        descriptor      : globalTestEnv.topTestDescriptor,
                        // TS can't figure out types compatibility
                        reporter        : globalTestEnv.launcher as TestReporterChild
                    } as Partial<InstanceType<T>>)
                } else {
                    // launched standalone, by user executing the test file
                    globalTestEnv.topTest   = this.new({
                        descriptor      : this.prototype.testDescriptorClass.new()
                    } as Partial<InstanceType<T>>)

                    this.launchStandalone()
                }
            }

            const currentTest       = globalTestEnv.currentTest || globalTestEnv.topTest

            return currentTest.it(name, code) as InstanceType<T>
        }


        static describe<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
            return this.it(name, code)
        }


        static ddescribe<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
            return this.iit(name, code)
        }


        static xdescribe<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
            return this.xit(name, code)
        }


        static getSelfUrl () : string {
            throw new Error("Abstract method")
        }

        static getInputArguments () : string[] {
            throw new Error("Abstract method")
        }


        // TODO refactor the whole launching infrastructure
        static async launchStandalone () {
            const topTest       = globalTestEnv.topTest
            const descriptor    = topTest.descriptor

            const projectPlan   = this.prototype.testDescriptorClass.new({ url : '.' })

            projectPlan.planItem(descriptor)

            const projectData   = ProjectSerializableData.new({ projectPlan })

            const isomorphicTestClass       = await this.getIsomorphicTestClass()

            const launcher      = isomorphicTestClass.prototype.launcherClass.new({
                projectData,
                inputArguments          : isomorphicTestClass.getInputArguments()
            })

            descriptor.url      = projectPlan.title = isomorphicTestClass.getSelfUrl()

            try {
                await launcher.setup()
            } catch (e) {
                if (e instanceof LauncherError)
                    return
                else
                    throw e
            }

            // for standalone launch we use different test launch procedure, since we want to avoid deriving extra context
            // we don't use `TestLauncher.launchTest()` method for example

            const launch    = Launch.new({
                type                        : 'test',
                launcher,
                projectData,
                projectPlanItemsToLaunch    : projectPlan.leavesAxis(),
                targetContextChannelClass   : ChannelSameContext
            })

            await launch.setup()

            const channel           = launch.testLauncherChannelClass.new() as ChannelTestLauncher & ChannelSameContext

            const setupPromise      = channel.setup()

            const testLauncher      = channel.parentPort

            const reporter          = testLauncher.reporter   = launch.reporter

            await setupPromise

            topTest.reporter        = channel.childPort as TestLauncherChild

            reporter.onTestSuiteStart()

            await topTest.start()

            reporter.onTestSuiteFinish()
        }


        static async getIsomorphicTestClass () : Promise<typeof Test> {
            if (isNodejs())
                return (await import('./TestNodejs.js')).TestNodejs
            else
                return (await import('./TestBrowser.js')).TestBrowser
        }
    }

    return Test
}) {}


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
type TestSectionConstructor<TestClass extends Test>  = (name : TestDescriptorArgument<TestClass>, code : (t : TestClass) => any) => TestClass

export const createTestSectionConstructors = <T extends typeof Test>(testClass : T) => {
    return {
        it          : testClass.it.bind(testClass) as TestSectionConstructor<InstanceType<T>>,
        iit         : testClass.iit.bind(testClass) as TestSectionConstructor<InstanceType<T>>,
        xit         : testClass.xit.bind(testClass) as TestSectionConstructor<InstanceType<T>>,
        describe    : testClass.describe.bind(testClass) as TestSectionConstructor<InstanceType<T>>,
        ddescribe   : testClass.ddescribe.bind(testClass) as TestSectionConstructor<InstanceType<T>>,
        xdescribe   : testClass.xdescribe.bind(testClass) as TestSectionConstructor<InstanceType<T>>
    }
}

export const { it, iit, xit, describe, ddescribe, xdescribe } = createTestSectionConstructors(Test)


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
