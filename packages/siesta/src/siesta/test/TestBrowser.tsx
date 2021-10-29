import { AnyFunction, ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextBrowser } from "../../context/ExecutionContextBrowser.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { isNodejs, prototypeValue } from "../../util/Helpers.js"
import { elementFromPoint } from "../../util_browser/Dom.js"
import { Launcher } from "../launcher/Launcher.js"
import { ExitCodes } from "../launcher/Types.js"
import { PointerMovePrecision } from "../simulate/SimulatorMouse.js"
import { ActionTarget, Simulator } from "../simulate/Types.js"
import { UserAgentOnPage } from "../simulate/UserAgent.js"
import { MouseCursorVisualizer } from "../ui/MouseCursorVisualizer.js"
import { AssertionElement } from "./assertion/AssertionElement.js"
import { AssertionObservable } from "./assertion/AssertionObservable.js"
import { TextSelectionHelpers } from "./browser/TextSelectionHelpers.js"
import { TestLauncherChild } from "./port/TestLauncherChild.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorBrowser } from "./TestDescriptorBrowser.js"
import { Exception, SubTestCheckInfo } from "./TestResult.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the browser environment.
 */
export class TestBrowser extends Mixin(
    [
        UserAgentOnPage,
        AssertionObservable,
        AssertionElement,
        TextSelectionHelpers,
        Test
    ],
    (base : ClassUnion<
        typeof UserAgentOnPage,
        typeof AssertionObservable,
        typeof AssertionElement,
        typeof TextSelectionHelpers,
        typeof Test
    >) =>

    class TestBrowser extends base {
        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass     : typeof TestDescriptorBrowser

        descriptor          : TestDescriptorBrowser

        // @prototypeValue(ExecutionContextBrowser)
        // executionContextClass   : typeof ExecutionContext

        connector           : TestLauncherChild & Simulator

        mouseCursorVisualizer   : MouseCursorVisualizer     = MouseCursorVisualizer.new()


        addListenerToObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
            observable.addEventListener(event, listener)
        }


        removeListenerFromObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
            observable.removeEventListener(event, listener)
        }


        resolveObservable (source : ActionTarget) : Element {
            return this.resolveActionTarget(source)
        }


        get onAmbiguousQuery () : 'use_first' | 'warn' | 'throw' {
            return this.descriptor.onAmbiguousQuery
        }


        get mouseMovePrecision () : PointerMovePrecision {
            return this.descriptor.mouseMovePrecision
        }


        // @ts-expect-error
        get simulator () : Simulator {
            return this.connector
        }
        set simulator (value : Simulator) {
        }


        async setupRootTest () {
            await super.setupRootTest()

            await this.mouseCursorVisualizer.start()

            if (this.descriptor.expandBody) {
                const html      = document.documentElement
                const body      = document.body

                body.style.width    = html.style.width  = '100%'
                body.style.height   = html.style.height = '100%'
                body.style.margin   = body.style.padding = '0'
            }

            if (this.dashboardLaunchInfo) {
                //@ts-expect-error
                this.simulator.offset   = this.dashboardLaunchInfo.offset

                await this.simulator.simulateMouseMove([ 0, 0 ], { mouseMovePrecision : { kind : 'last_only', precision : 1 } })
            }
        }


        async launch (checkInfo : SubTestCheckInfo = undefined) {
            if (!this.parentNode && document.compatMode === 'BackCompat') {
                this.addResult(Exception.new({ exception : new Error('Test page is opened in the quirks mode') }))
                return
            }

            await super.launch(checkInfo)
        }


        async tearDownRootTest () {
            await super.tearDownRootTest()

            this.mouseCursorVisualizer.stop()
        }


        getElementAtCursor (deep : boolean = true) : Element {
            return elementFromPoint(this.window.document, ...this.simulator.currentPosition, deep).el
        }


        static async getIsomorphicTestClass () : Promise<typeof Test> {
            return this
        }


        static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
            return ExecutionContextBrowser
        }


        static async getLauncherClass () : Promise<typeof Launcher> {
            return (await import('../launcher/LauncherBrowser.js')).LauncherBrowser
        }


        // TODO refactor the whole launching infrastructure
        static async launchStandalone () {
            if (isNodejs()) {
                const styles                = (await import("../reporter/styling/theme_universal.js")).styles
                const colorerClass          = (await import('../../jsx/ColorerNodejs.js')).ColorerNodejs
                const c                     = colorerClass.new()
                const style                 = (clsName : string) => styles.get(clsName)(c)

                console.log(
`${ style('exception_icon').text(' ERROR ') } Browser test launched directly as Node.js script.
Please use Siesta launcher instead and web url:
  ${ style('accented').text('npx siesta http://web_path/to/your/test.js') }`
                )

                process.exitCode            = ExitCodes.INCORRECT_ENVIRONMENT

                return
            } else
                super.launchStandalone()
        }
    }

) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const api = createTestSectionConstructors(TestBrowser)

/**
 * Alias for {@link TestBrowser.it | it} method.
 */
export const it = api.it

/**
 * Alias for {@link TestBrowser.iit | iit} method.
 */
export const iit = api.iit

/**
 * Alias for {@link TestBrowser.xit | xit} method.
 */
export const xit = api.xit

/**
 * Alias for {@link TestBrowser.describe | describe} method.
 */
export const describe = api.describe

/**
 * Alias for {@link TestBrowser.ddescribe | ddescribe} method.
 */
export const ddescribe = api.ddescribe

/**
 * Alias for {@link TestBrowser.xdescribe | xdescribe} method.
 */
export const xdescribe = api.xdescribe
