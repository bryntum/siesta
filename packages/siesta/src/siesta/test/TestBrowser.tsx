import { AnyFunction, ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextAttachableBrowser, ExecutionContextBrowser } from "../../context/ExecutionContextBrowser.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { isNodejs, prototypeValue, typeOf, wantArray } from "../../util/Helpers.js"
import { awaitDomInteractive, elementFromPoint } from "../../util_browser/Dom.js"
import { isHTMLLinkElement, isHTMLScriptElement } from "../../util_browser/Typeguards.js"
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
import { normalizePreloadDescriptor, TestDescriptorBrowser } from "./TestDescriptorBrowser.js"
import { Assertion, Exception, SubTestCheckInfo } from "./TestResult.js"


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
        ExecutionContextAttachableBrowser,
        Test
    ],
    (base : ClassUnion<
        typeof UserAgentOnPage,
        typeof AssertionObservable,
        typeof AssertionElement,
        typeof TextSelectionHelpers,
        typeof ExecutionContextAttachableBrowser,
        typeof Test
    >) =>

    class TestBrowser extends base {
        // allow the browser test initialize w/o exception even in Node.js environment
        // (we'll issue a meaningful error in this case later)
        window                  : Window                        = typeof window !== 'undefined' ? window : undefined

        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass     : typeof TestDescriptorBrowser

        descriptor          : TestDescriptorBrowser

        // @prototypeValue(ExecutionContextBrowser)
        // executionContextClass   : typeof ExecutionContext

        connector           : TestLauncherChild & Simulator

        mouseCursorVisualizer   : MouseCursorVisualizer     = MouseCursorVisualizer.new()


        addListenerToObservable (observable : unknown, event : string, listener : AnyFunction) {
            // @ts-ignore
            observable.addEventListener(event, listener)
        }


        removeListenerFromObservable (observable : unknown, event : string, listener : AnyFunction) {
            // @ts-ignore
            observable.removeEventListener(event, listener)
        }


        resolveObservable (source : ActionTarget) : unknown {
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


        async setupPreloads () {
            await awaitDomInteractive()

            // TODO clean this up
            // there's now pre-normalization step in the "flatten" method,
            // which converts all `PreloadDescriptor`s to `PreloadDescriptorNormalized`
            // and "absolutize" their `url`s, so these conversions are not needed
            // even though they are not harmful (since every `PreloadDescriptorNormalized`
            // is also a regular `PreloadDescriptor`)
            const preloads      = wantArray(this.descriptor.preload || [])
                .concat(this.descriptor.alsoPreload || [])
                .flat(2000)
                .filter(el => Boolean(el))
                .map(normalizePreloadDescriptor)

            const doc   = this.window.document

            const waitFor : Promise<Event | undefined>[]        = []

            for (const preload of preloads) {
                if (preload.type === 'js') {
                    const el    = doc.createElement('script')

                    // @ts-ignore
                    el.PRELOAD  = true

                    el.type = preload.isEcmaModule ? 'module' : 'text/javascript'
                    preload.isEcmaModule && el.setAttribute("crossorigin", "anonymous")

                    if ('url' in preload) {
                        // TODO clean this up, see note above
                        // el.src = new URL(preload.url, this.descriptor.urlAbs).href
                        el.src = preload.url

                        waitFor.push(new Promise((resolve, reject) => {
                            el.addEventListener('load', () => resolve(undefined))
                            el.addEventListener('error', resolve)
                        }))
                    }
                    else
                        el.text = preload.content

                    doc.head.appendChild(el)
                }
                else {
                    if ('url' in preload) {
                        const el    = doc.createElement('link')

                        // @ts-ignore
                        el.PRELOAD  = true

                        el.type     = 'text/css'
                        el.rel      = 'stylesheet'
                        // TODO clean this up, see note above
                        // el.href     = new URL(preload.url, this.descriptor.urlAbs).href
                        el.href     = preload.url

                        waitFor.push(new Promise((resolve, reject) => {
                            el.addEventListener('load', () => resolve(undefined))
                            el.addEventListener('error', resolve)
                        }))

                        doc.head.appendChild(el)
                    }
                    else {
                        const el    = doc.createElement('style')

                        el.setAttribute("type", 'text/css')

                        el.appendChild(document.createTextNode(preload.content))

                        doc.head.appendChild(el)
                    }
                }
            }

            const results   = await Promise.all(waitFor)

            for (const result of results) {
                if (result) {
                    const target    = result.target

                    const url       = target
                        ? isHTMLScriptElement(target)
                            ? target.src
                            : isHTMLLinkElement(target)
                                ? target.href
                                : undefined
                        : undefined

                    this.addResult(Assertion.new({
                        name        : 'Resource preloading failure',
                        passed      : false,
                        annotation  : url
                            ? <div>
                                Preloading of the `{ url }` has failed
                            </div>
                            : <div>
                                Preloading of the resource has failed.
                            </div>
                    }))
                }
            }
        }


        override async setupExecutionContext () {
            await super.setupExecutionContext()

            if (this.descriptor.failOnResourceLoadError)
                this.onResourceLoadFailureHook.on((me : TestBrowser, event : Event) => {
                    // ignore the loading errors from the elements, that were created by the preload mechanism -
                    // it has its own error reporting
                    // @ts-ignore
                    if (event.target.PRELOAD) return

                    const target    = event.target

                    const url       = target
                        ? isHTMLScriptElement(target)
                            ? target.src
                            : isHTMLLinkElement(target)
                                ? target.href
                                : undefined
                        : undefined

                    this.addResult(Assertion.new({
                        name        : 'Resource loading failure',
                        passed      : false,
                        // TODO, should probably include serialized element to the annotation
                        annotation  : url
                            ? <div>
                                Loading of the `{ url }` has failed
                            </div>
                            : <div>
                                Loading of the resource has failed.
                            </div>
                    }))
                })
        }


        override async setupRootTest () {
            const superSetup            = super.setupRootTest()
            const mouseCursorVisStart   = this.mouseCursorVisualizer.start()

            const doc   = this.window.document

            if (this.descriptor.expandBody) {
                const html      = doc.documentElement
                const body      = doc.body

                body.style.width    = html.style.width  = '100%'
                body.style.height   = html.style.height = '100%'
                body.style.margin   = body.style.padding = '0'
            }

            let mousePositionRestore    = Promise.resolve()

            if (this.dashboardLaunchInfo) {
                // @ts-expect-error
                this.simulator.offset   = this.dashboardLaunchInfo.offset

                mousePositionRestore    = await this.simulator.simulateMouseMove([ 0, 0 ], { mouseMovePrecision : { kind : 'last_only', precision : 1 } })
            }

            // this will await until the `super` method installs the ExecutionContext hooks
            await superSetup

            await Promise.all([ mouseCursorVisStart, mousePositionRestore, this.setupPreloads() ])
        }


        async launch (checkInfo : SubTestCheckInfo = undefined) {
            if (!this.parentNode && this.window.document.compatMode === 'BackCompat') {
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
