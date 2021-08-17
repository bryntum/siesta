import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext, ExecutionContextAttachable } from "../../context/ExecutionContext.js"
import { Hook } from "../../hook/Hook.js"
import { XmlNode } from "../../jsx/XmlElement.js"
import { Logger, LogLevel, LogMethod } from "../../logger/Logger.js"
import { parse } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { ArbitraryObject, ArbitraryObjectKey, isDeno, isNodejs, prototypeValue } from "../../util/Helpers.js"
import { stripBasename, stripDirname } from "../../util/Path.js"
import { isString } from "../../util/Typeguards.js"
import { Environment } from "../common/Environment.js"
import { Launcher, LauncherError } from "../launcher/Launcher.js"
import { SiestaProjectExtraction } from "../launcher/ProjectExtractor.js"
import { Project } from "../project/Project.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { AssertionAsync } from "./assertion/AssertionAsync.js"
import { AssertionCompare } from "./assertion/AssertionCompare.js"
import { AssertionException } from "./assertion/AssertionException.js"
import { AssertionGeneral } from "./assertion/AssertionGeneral.js"
import { AssertionType } from "./assertion/AssertionType.js"
import { Expectation } from "./Expectation.js"
import { TestLauncherChild } from "./port/TestLauncher.js"
import { TestReporterChild } from "./port/TestReporter.js"
import { Spy, SpyFunction } from "./Spy.js"
import { TestDescriptor, TestDescriptorArgument } from "./TestDescriptor.js"
import { Assertion, AssertionAsyncResolution, Exception, LogMessage, SubTestCheckInfo, TestNodeResult, TestResult } from "./TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
class TestPre extends Mixin(
    [
        TestNodeResult,
        Logger,
        ExecutionContextAttachable,
        AssertionAsync,
        AssertionCompare,
        AssertionException,
        AssertionGeneral,
        AssertionType
    ],
    (base : ClassUnion<
        typeof TestNodeResult,
        typeof Logger,
        typeof ExecutionContextAttachable,
        typeof AssertionAsync,
        typeof AssertionCompare,
        typeof AssertionException,
        typeof AssertionGeneral,
        typeof AssertionType
    >) =>

    // when using the un-exported mixin class, the internal class need to have different name
    class TestPreInternal extends base {
    }
){}


/**
 * The test class for the isomorphic code. The instances of this class are usually created with the [[Test.it|it]] call:
 *
 * ```ts
 * import { it } from "siesta/index.js"
 *
 * it('Isomorphic Siesta test', async (t : Test) => {
 *     ...
 * })
 * ```
 *
 * Using various assertion methods of the test instance one can create a testing scenario.
 *
 * The configuration of the test class is extracted into separate class, called [[TestDescriptor]]. This is done to be able
 * to transfer the configuration over the network (`TestDescriptor` is serializable, whereas `Test` is not). Each test class
 * has the [[Test.testDescriptorClass|testDescriptorClass]] property, which should contain the constructor of the [[TestDescriptor]] class
 * to use for configuration.
 */
export class Test extends TestPre {
    /**
     * The constructor of the [[TestDescriptor]] class (or its subclass), which represents the configuration object
     * for the current test class.
     */
    @prototypeValue(TestDescriptor)
    testDescriptorClass : typeof TestDescriptor

    executionContext    : ExecutionContext      = undefined

    // "upgrade" types from TreeNode
    parentNode          : Test

    code                : (t : this) => any     = t => {}

    pendingSubTests     : Test[]                = []

    reporter            : TestReporterChild     = undefined

    beforeEachHooks     : ((t : this) => any)[] = []
    afterEachHooks      : ((t : this) => any)[] = []

    isExclusive         : boolean               = false

    // not related to `before/afterEach` hooks, completely different thing
    preStartHook        : Hook<[ this ]>        = new Hook()
    startHook           : Hook<[ this ]>        = new Hook()

    // can still add assertions in this hook
    finishHook          : Hook<[ this ]>        = new Hook()
    // can _not_ add assertions in this hook
    postFinishHook      : Hook<[ this ]>        = new Hook()

    spies               : Spy[]                 = []


    $rootTest           : Test      = undefined

    get rootTest () : Test {
        if (this.$rootTest !== undefined) return this.$rootTest

        let rootTest : Test       = this

        while (rootTest.parentNode) rootTest    = rootTest.parentNode

        return this.$rootTest = rootTest
    }

    /**
     *
     * This method returns an "expectation" instance, which can be used to check various assertions about the passed value.
     *
     * Every expectation has a special property `not`, that contains another expectation, but with the negated meaning.
     *
     * For example:
     *
     * ```ts
     * t.expect(1).toBe(1)
     * t.expect(1).not.toBe(2)
     *
     * t.expect('Foo').toContain('oo')
     * t.expect('Foo').not.toContain('bar')
     * ```
     * Please refer to the documentation of the [[Expectation]] class for the list of available methods.
     *
     * @param received
     */
    expect (received : unknown) : Expectation {
        return Expectation.new({ value: received, t : this })
    }


    /**
     * This method allows you to execute some "setup" code hook before every "it" section of the current test.
     * It is usually used to restore some global state to the predefined value.
     *
     * `it` sections can be nested, and hooks can be added at every level.
     * `beforeEach` hooks are executed starting from the outer-most one level.
     *
     * The 1st argument of the hook function is always the test instance being launched.
     *
     * If the hook function is `async` Siesta will `await` until it completes.
     *
     * This method can be called several times, providing several hook functions to execute.
     *
     * ```javascript
     * import { it, beforeEach } from "siesta/index.js"
     *
     * let sum

     * beforeEach(() => sum = 0)
     *
     * it('Test section #1', async t => {
     *     sum++
     *     t.equal(sum, 1)
     * })
     *
     * it('Test section #2', async t => {
     *     sum++
     *     t.equal(sum, 1)
     * })
     * ```
     *
     * @param code
     */
    beforeEach (code : (t : this) => any) {
        this.beforeEachHooks.push(code)
    }


    /**
     * This method allows you to execute some "cleanup" code hook after every "it" section of the current test.
     * It is usually used to clear some global resource, used by the tests. Sometimes it is actually more convenient,
     * instead of clearing the resource in the `afterEach` do that in the `beforeEach`, after checking that resource
     * has been allocated. In this way, if you'll be debugging some individual test section, the resource will still be
     * available after the test completion.
     *
     * `it` sections can be nested, and hooks can be added at every level.
     * `afterEach` hooks are executed starting from the inner-most one level.
     *
     * The 1st argument of the hook function is always the test instance being launched.
     *
     * If the hook function is `async` Siesta will `await` until it completes.
     *
     * This method can be called several times, providing several hook functions to execute.
     *
     * ```javascript
     * import { it, beforeEach } from "siesta/index.js"
     *
     * let file
     * beforeEach(() => file = OPEN_FILE())
     * afterEach(() => CLOSE_FILE(file))
     *
     * it('Test section #1', async t => {
     *     sum++
     *     t.equal(sum, 1)
     * })
     *
     * it('Test section #2', async t => {
     *     sum++
     *     t.equal(sum, 1)
     * })
     * ```
     *
     * @param code
     */
    afterEach (code : (t : this) => any) {
        this.afterEachHooks.push(code)
    }


    addResult<T extends TestResult> (result : T) : T {
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
            type        : 'log',
            level       : LogLevel[ method ],
            message     : this.prepareLogMessage(...message)
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


    /**
     * This method has the same functionality as [[it]], plus it sets the [[TestDescriptor.isTodo|isTodo]] config of the test descriptor to `true`.
     */
    todo (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
        const test              = this.it(name, code)

        test.descriptor.isTodo  = true

        return test
    }


    /**
     * This is a no-op method, allowing you to quickly ignore some test sections - just add `x` ("exclude") to the section call.
     */
    xit (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
        const cls       = this.constructor as typeof Test

        const test      = cls.new()

        // return a dummy test instance to keep the possibly dependent code happy
        return test as this
    }

    /**
     * This is an "exclusive" version of the regular {@link it} test section. When such exclusive section is found,
     * the other regular test sections at the same level will not be executed, only "exclusive" ones.
     */
    iit (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
        const test          = this.it(name, code)

        test.isExclusive    = true

        return test
    }


    /**
     * This method creates a "parent" node in the test file, grouping assertions together. Such node is called "test section" or "sub-test".
     * Sub-tests can be nested arbitrarily.
     *
     * The 1st argument for this method can be either a string or a configuration object for this test's [[TestDescriptor|descriptor]].
     * The string value corresponds to `{ title : 'string_value' }`.
     *
     * The configuration object of the nested test section "extends" the configuration object of the parent section.
     *
     * For example if parent section sets the [[TestDescriptor.defaultTimeout|defaultTimeout]] to a certain value, the nested section
     * will use that value too.
     *
     * ```javascript
     * import { it } from "siesta/index.js"
     *
     * it({ title : 'Test section', defaultTimeout : 1000 }, async t => {
     *     t.it('Nested test section', async t => {
     *         // will fail within 1s
     *         await t.waitFor(() => false)
     *     })
     * })
     * ```
     *
     * See also [[iit]], [[xit]] methods to quickly isolate/exclude a test section.
     *
     * To create a top-level test section, the [["src/siesta/test/Test".it|it]] function or <a href="#it-1">it</a> static
     * method should be used. These aliases can actually be used inside the test function as well, however
     * it is recommended to use the method on the test instance.
     *
     * ```ts
     * import { it, Test } from "siesta/index.js"
     *
     * it('Test section', async (t : Test) => {
     *     t.it({ title : 'Nested section', isTodo : true }, async (t : Test) => {
     *         ...
     *     })
     * })
     *
     * // The following two lines are identical
     * it('Test section', async (t : Test) => { ... }) // `it` function
     * Test.it('Test section', async (t : Test) => { ... }) // static `Test.it` method
     * ```
     *
     * @param name The configuration descriptor for the test section
     * @param code The test function. Can be `async` if needed or return `Promise`.
     */
    it (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
        const descriptor : TestDescriptor   = TestDescriptor.fromTestDescriptorArgument(name)

        // if (this.isTodo) descriptor.isTodo  = true

        // TODO I promise to myself to clean this up
        // mess
        this.descriptor.planItem(descriptor)
        const flatten   = descriptor.flatten
        this.descriptor.removeItem(descriptor)
        // need to turn the node into leaf again, after adding/removing child
        this.descriptor.childNodes = undefined
        // eof mess

        const cls       = this.constructor as typeof Test

        const test      = cls.new({ descriptor : flatten, code, parentNode : this, reporter : this.reporter })

        this.pendingSubTests.push(test)

        return test as this
    }


    /**
     * An alias for [[it]]
     */
    describe (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
        return this.it(name, code)
    }

    /**
     * An alias for [[iit]]
     */
    ddescribe (name : TestDescriptorArgument<this>, code : (t : this) => any) : this {
        return this.iit(name, code)
    }


    // failOnExceptionDuringImport (exception : unknown) {
    //     this.reporter.onSubTestStart(this.localId, this.parentNode ? this.parentNode.localId : null, this.descriptor)
    //
    //     this.addResult(Exception.new({ exception }))
    //
    //     this.reporter.onSubTestFinish(this.localId)
    // }


    async start (checkInfo : SubTestCheckInfo = undefined) {
        // extra-early start hook, test is not yet marked as active in the reporter
        this.preStartHook.trigger(this)

        globalTestEnv.currentTest       = this

        this.reporter.onSubTestStart(this.localId, this.parentNode ? this.parentNode.localId : null, this.descriptor)

        // start hook, test is marked as active in the reporter
        this.startHook.trigger(this)

        if (this.isRoot) {
            await this.setupRootTest()
            await this.setup()
        }

        await this.launch(checkInfo)

        if (this.isRoot) {
            await this.tearDown()
            await this.tearDownRootTest()
        }

        // finish hook, test is still marked as active in the reporter
        this.finishHook.trigger(this)

        this.reporter.onSubTestFinish(this.localId, false)

        globalTestEnv.currentTest       = this.parentNode

        // extra-late finish hook, test is already not marked as active in the reporter
        this.postFinishHook.trigger(this)

        this.cleanup()
    }


    cleanup () {
        this.spies.forEach(spy => spy.remove())
    }


    prepareLogMessage (...messages : unknown[]) : XmlNode[] {
        if (messages.length === 1)
            return messages.map(message => isString(message) ? message : SerializerXml.serialize(message, this.descriptor.serializerConfig))
        else
            return [ SerializerXml.serialize(messages, this.descriptor.serializerConfig) ]
    }


    $suppressOutputLogging       : boolean       = false

    get suppressOutputLogging () : boolean {
        return this.parentNode ? this.parentNode.suppressOutputLogging : this.$suppressOutputLogging
    }

    // TODO
    // need to figure out if we need to wait until all reports (`this.reporter.onXXX`)
    // has been completed or not, before completing the method
    async launch (checkInfo : SubTestCheckInfo = undefined) {
        this.onExceptionHook.on((test, exception, type) => {
            this.addResult(Exception.new({ exception }))
        })

        this.onConsoleHook.on((test, logMethod, messages) => {
            this.addResult(LogMessage.new({
                type        : 'console',
                level       : LogLevel[ logMethod ],
                message     : this.prepareLogMessage(...messages)
            }))
        })

        this.onOutputHook.on((test, outputType, message, buffer, originalWriteMethod, scope) => {
            if (this.suppressOutputLogging)
                originalWriteMethod.call(scope, buffer)
            else this.addResult(LogMessage.new({
                type        : 'output',
                level       : LogLevel.error,
                outputType,
                message     : this.prepareLogMessage(message)
            }))
        })


        this.rootTest.executionContext.attach(this)

        const beforeHooks   = this.collectParents(true).flatMap(parent => parent.beforeEachHooks)
        const afterHooks    = this.collectParents().flatMap(parent => parent.afterEachHooks)

        for (const hook of beforeHooks) await hook(this)

        try {
            await this.code(this)
        } catch (exception) {
            this.addResult(Exception.new({ exception }))
        }

        const exclusiveSubTests = this.pendingSubTests.filter(subTest => subTest.isExclusive)
        const subTestsToLaunch  = exclusiveSubTests.length > 0 ? exclusiveSubTests : this.pendingSubTests

        let currentCheckInfoIndex       = 0

        while (subTestsToLaunch.length) {
            const subTest       = subTestsToLaunch.shift()

            this.addResult(subTest)

            // TODO
            // supports the launching individual test file case
            // in that case the `reporter` appears already after
            // the test structure is defined
            subTest.reporter    = this.reporter

            if (checkInfo) {
                const currentCheckInfo  = checkInfo.childNodes?.[ currentCheckInfoIndex ]

                if (currentCheckInfo && subTest.descriptor.title === currentCheckInfo.title) {
                    await subTest.start(currentCheckInfo)
                    currentCheckInfoIndex++
                }
                else {
                    // HACK
                    // reporter does not have an ability to react on addition of subtest result above
                    // instead it always assumes subtest is launched
                    // so we do that, with a special flag for `onSubTestFinish`
                    // this can be improved
                    this.reporter.onSubTestStart(subTest.localId, subTest.parentNode ? subTest.parentNode.localId : null, subTest.descriptor)
                    this.reporter.onSubTestFinish(subTest.localId, true)
                }
            } else
                await subTest.start()
        }

        await this.awaitAllDone()

        for (const hook of afterHooks) await hook(this)

        this.rootTest.executionContext.detach(this)
    }


    async awaitAllDone () {
        do {
            const ongoing       = this.ongoing

            try {
                await this.ongoing
            } catch (exception) {
                this.addResult(Exception.new({ exception }))
            }

            // `ongoing` promise instance did not change during its own `await` - means no new promises
            // has been scheduled - we are done
            if (ongoing === this.ongoing) break
        } while (true)
    }


    async setupRootTest () {
        const executionContextClass     = await (this.constructor as typeof Test).getExecutionContextClass()

        this.executionContext           = executionContextClass.new()

        this.executionContext.setup()
    }


    // TODO should have timeout property
    async setup () {
    }


    async tearDown () {
    }


    async tearDownRootTest () {
        this.executionContext.destroy()
    }


    /**
     * This method installs a "spy" instead of normal function in some object. The "spy" is basically another function,
     * which tracks its calls. With spies, one can verify that some function has been called and that
     * it has been called with certain arguments.
     *
     * By default, spy will call the original method and return a value from it. To enable different behavior, you can use one of these methods:
     *
     * - {@link Spy.returnValue|returnValue} - return a specific value
     * - {@link Spy.callThrough|callThrough} - call the original method and return a value from it
     * - {@link Spy.stub|stub} - call the original method and return a value from it
     * - {@link Spy.callFake|callFake} - call the provided function and return a value from it
     * - {@link Spy.throwError|throwError} - throw a specific exception object
     *
     * For example:
     * ```ts
     * // spy that tracks the calls to `process`
     * const spy = t.spyOn(obj, 'process')
     *
     * // or, if you need to also mock the method
     * const spy = t.spyOn(obj, 'process').callFake(() => {
     *     // is called instead of `process` method
     * })
     *
     * // call the method
     * obj.process('fast', 1)
     *
     * t.expect(spy).toHaveBeenCalled();
     * t.expect(spy).toHaveBeenCalledWith('fast', 1);
     * ```
     *
     * See also {@link createSpy}, {@link createSpyObj}, {@link Expectation.toHaveBeenCalled|toHaveBeenCalled},
     * {@link Expectation.toHaveBeenCalledWith|toHaveBeenCalledWith}
     *
     * See also the {@link Spy} class for additional details.
     *
     * @param object An object which property is being spied
     * @param propertyName A name of the property over which to install the spy.
     *
     * @return spy Created spy instance
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
     * spy instance, which is available as `and` property. One can use the {@link Spy} class API to
     * verify the calls to the spy function.
     *
     * For example:
     * ```ts
     * const spyFunc     = t.createSpy('onadd listener')
     *
     * myObservable.addEventListener('add', spyFunc)
     *
     * // do something that triggers the `add` event on the `myObservable`
     *
     * t.expect(spyFunc).toHaveBeenCalled()
     *
     * t.expect(spyFunc.calls.argsFor(1)).toEqual([ 'Arg1', 'Arg2' ])
     * ```
     *
     * See also: {@link spyOn}
     *
     * @param spyName A name of the spy for debugging purposes
     *
     * @return Created function. The associated spy instance is assigned to it as the `spy` property
     */
    createSpy (spyName : string = 'James Bond') : Function & { spy : Spy } {
        return Spy.new({
            name            : spyName,
            t               : this
        }).stub().processor
    }


    /**
     * This method creates an object, which properties are spy functions. Such object can later be used as a mockup.
     *
     * This method can be called with one argument only, which should be an array of properties.
     *
     * For example:
     * ```ts
     * const mockup      = t.createSpyObj('encoder-mockup', [ 'encode', 'decode' ])
     * // or just
     * const mockup      = t.createSpyObj([ 'encode', 'decode' ])
     *
     * mockup.encode('string')
     * mockup.decode('string')
     *
     * t.expect(mockup.encode).toHaveBeenCalled()
     * ```
     *
     * See also: {@link createSpy}
     *
     * @param spyName A name of the spy object. Can be omitted.
     * @param properties An array of the property names. For each property name a spy function will be created.
     *
     * @return A mockup object
     */
    createSpyObj (properties : ArbitraryObjectKey[]) : ArbitraryObject<SpyFunction> {
        const obj           = {}

        properties.forEach(propertyName =>
            obj[ propertyName ] = this.createSpy(String(propertyName))
        )

        return obj
    }

    /**
     * Alias for [[Test.iit]]. Should be used for top-level sub-tests only.
     *
     * @param name
     * @param code
     */
    static iit<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
        const test          = this.it(name, code)

        test.isExclusive    = true

        return test
    }


    /**
     * Alias for [[Test.xit]]. Should be used for top-level sub-tests only.
     *
     * @param name
     * @param code
     */
    static xit<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
        return this.new()
    }

    /**
     * Static alias for [[Test.it]]. Should be used for top-level sub-tests only. Can be useful if you create your own subclass of the test class.
     *
     * @param name
     * @param code
     */
    static it<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
        if (!globalTestEnv.topTest) {

            if (globalTestEnv.hasPendingTest) {
                // launched from the outside, by the Launcher
                globalTestEnv.topTest   = this.new({
                    descriptor      : parse(globalTestEnv.topTestDescriptorStr),
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


    /**
     * Alias for [[Test.it]].
     */
    static describe<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
        return this.it(name, code)
    }


    /**
     * Alias for [[Test.iit]].
     */
    static ddescribe<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
        return this.iit(name, code)
    }


    /**
     * Alias for [[Test.xit]].
     */
    static xdescribe<T extends typeof Test> (this : T, name : TestDescriptorArgument<InstanceType<T>>, code : (t : InstanceType<T>) => any) : InstanceType<T> {
        return this.xit(name, code)
    }


    // TODO these 2 methods should probably reside in the Launcher or in the separate abstraction
    static getSelfUrl () : string {
        throw new Error("Abstract method")
    }

    static getInputArguments () : string[] {
        throw new Error("Abstract method")
    }


    static async launchStandalone () {
        const topTest       = globalTestEnv.topTest
        const descriptor    = topTest.descriptor

        const projectPlan   = this.prototype.testDescriptorClass.new({ url : '.' })

        if (isNodejs() || isDeno()) {
            projectPlan.planItem(descriptor)

            // trying hard to not create an extra context for the standalone test launch case
            // this is to aid the debugging ergonomics for developers (everything happens in the
            // same context => easy "native" debugging)
            //
            // the biggest mess happens with the output logging - in the test context,
            // we override the output to stdout/stderr and route it to the test log
            // however, when both test and launcher are in the same context
            // we should ignore the output to stdout, performed by launcher
            // this is done using the `$suppressOutputLogging` flag on top test

            const isomorphicTestClass       = await this.getIsomorphicTestClass()

            const projectData   = ProjectSerializableData.new({
                launchType              : 'test',
                environment             : Environment.detect(),
                projectPlan,
                siestaPackageRootUrl    : import.meta.url.replace(/src\/siesta\/test\/Test.js$/, ''),
                // TODO should get the environment from `isomorphicTestClass` somehow instead of descriptor
                type                    : descriptor.type
            })

            const launcher      = (await this.getLauncherClass()).new({
                projectData,
                inputArguments          : isomorphicTestClass.getInputArguments()
            })

            launcher.beforePrintHook.on(() => topTest.$suppressOutputLogging = true)
            launcher.afterPrintHook.on(() => topTest.$suppressOutputLogging = false)

            descriptor.url      = projectPlan.title = isomorphicTestClass.getSelfUrl()

            // TODO this is how it is supposed to be:
            // const selfUrl           = isomorphicTestClass.getSelfUrl()
            //
            // projectPlan.title       = selfUrl
            // projectPlan.url         = stripBasename(selfUrl)
            // descriptor.filename     = stripDirname(selfUrl)
            //
            // projectPlan.planItem(descriptor)


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
            const dispatcher            = launcher.dispatcher

            await dispatcher.launchStandaloneSameContextTest(topTest)

            launcher.setExitCode(launcher.computeExitCode())
        } else {
            // TODO refactor this, to not create extra context and do everything in the test context,
            // as in Node.js case above
            const extraction        = globalThis.__SIESTA_PROJECT_EXTRACTION__ as SiestaProjectExtraction

            extraction.state        = 'project_created'

            projectPlan.url         = stripBasename(extraction.projectUrl)
            descriptor.filename     = stripDirname(extraction.projectUrl)

            projectPlan.planItem(descriptor)

            const projectClass      = await this.getProjectClass()

            const project           = projectClass.new({
                title       : extraction.projectUrl,
                launchType  : 'test',
                projectPlan
            })

            await project.start()
        }
    }


    // TODO remove this method, once the `getSelfUrl` and `getInputArgs` are moved to Launcher
    static async getIsomorphicTestClass () : Promise<typeof Test> {
        if (isNodejs())
            return (await import(/* @vite-ignore */''.concat('./TestNodejs.js'))).TestNodejs
        else if (isDeno())
            return (await import(/* @vite-ignore */''.concat('./TestDeno.js'))).TestDeno
        else
            return (await import('./TestBrowser.js')).TestBrowser
    }


    static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
        if (isNodejs())
            return (await import(/* @vite-ignore */''.concat('../../context/ExecutionContextNode.js'))).ExecutionContextNode
        else if (isDeno())
            return (await import(/* @vite-ignore */''.concat('../../context/ExecutionContextDeno.js'))).ExecutionContextDeno
        else
            return (await import('../../context/ExecutionContextBrowser.js')).ExecutionContextBrowser
    }


    static async getLauncherClass () : Promise<typeof Launcher> {
        if (isNodejs())
            return (await import(/* @vite-ignore */''.concat('../launcher/LauncherNodejs.js'))).LauncherNodejs
        else if (isDeno())
            return (await import(/* @vite-ignore */''.concat('../launcher/LauncherDeno.js'))).LauncherDeno
        else
            return (await import('../launcher/LauncherBrowser.js')).LauncherBrowser
    }


    static async getProjectClass () : Promise<typeof Project> {
        if (isNodejs())
            return (await import(/* @vite-ignore */''.concat('../project/ProjectNodejs.js'))).ProjectNodejs
        else if (isDeno())
            return (await import(/* @vite-ignore */''.concat('../project/ProjectDeno.js'))).ProjectDeno
        else
            return (await import('../project/ProjectBrowser.js')).ProjectBrowser
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class GlobalTestEnvironment extends Base {
    launcher                : TestLauncherChild = undefined

    // the test instance, representing the whole current test file
    // not directly accessible by user, but every global `it/describe` section
    // is created as child node of it
    topTest                 : Test              = undefined

    topTestDescriptorStr    : string            = globalThis.__SIESTA_GLOBAL_TEST_DESC_STR__

    currentTest             : Test              = undefined


    get hasPendingTest () : boolean {
        return Boolean(this.topTestDescriptorStr)
    }


    clear () {
        this.launcher               = undefined
        this.topTest                = undefined
        this.topTestDescriptorStr   = undefined
        this.currentTest            = undefined
    }
}

export const globalTestEnv : GlobalTestEnvironment = GlobalTestEnvironment.new()

Object.defineProperty(globalThis, '__SIESTA_GLOBAL_TEST_ENV__', {
    enumerable      : false,
    value           : globalTestEnv
})



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

export const {
    /**
     * Alias for {@link Test.it | it} method.
     */
    it,

    /**
     * Alias for {@link Test.iit | iit} method.
     */
    iit,

    /**
     * Alias for {@link Test.xit | xit} method.
     */
    xit,

    /**
     * Alias for {@link Test.describe | describe} method.
     */
    describe,

    /**
     * Alias for {@link Test.ddescribe | ddescribe} method.
     */
    ddescribe,

    /**
     * Alias for {@link Test.xdescribe | xdescribe} method.
     */
    xdescribe
} = createTestSectionConstructors(Test)


//---------------------------------------------------------------------------------------------------------------------
/**
 * Alias for {@link Test.beforeEach | beforeEach} method.
 */
export const beforeEach = (code : (t : Test) => any) => {
    if (!globalTestEnv.currentTest) throw new Error("Global `beforeEach` call used outside of the scope of any test")

    globalTestEnv.currentTest.beforeEach(code)
}

/**
 * Alias for {@link Test.afterEach | afterEach} method.
 */
export const afterEach = (code : (t : Test) => any) => {
    if (!globalTestEnv.currentTest) throw new Error("Global `afterEach` call used outside of the scope of any test")

    globalTestEnv.currentTest.afterEach(code)
}

//---------------------------------------------------------------------------------------------------------------------
/**
 * An alias for the [[Test.expect|expect]] method of the test class.
 *
 * @param received
 */
export const expect = (received : unknown) : Expectation => {
    if (!globalTestEnv.currentTest) throw new Error("Global `expect` call used outside of the scope of any test")

    return Expectation.new({ value: received, t : globalTestEnv.currentTest })
}
