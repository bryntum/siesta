import { ClassUnion, Mixin } from "typescript-mixin-class"
import { prototypeValue } from "../../util/Helpers.js"
import { isElementPointReachable } from "../../util_browser/Dom.js"
import { createTestSectionConstructors } from "../test/Test.js"
import { TestBrowser } from "../test/TestBrowser.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// dummy type for better signatures
export type ExtComponent        = any

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the browser environment.
 */
export class TestSencha extends Mixin(
    [
        TestBrowser
    ],
    (base : ClassUnion<
        typeof TestBrowser
    >) =>

    class TestSencha extends base {
        @prototypeValue(TestDescriptorSencha)
        testDescriptorClass     : typeof TestDescriptorSencha

        descriptor              : TestDescriptorSencha


        // addListenerToObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
        //     observable.addEventListener(event, listener)
        // }
        //
        //
        // removeListenerFromObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
        //     observable.removeEventListener(event, listener)
        // }
        //
        //
        // resolveObservable (source : ActionTarget) : Element {
        //     return this.resolveActionTarget(source)
        // }


        get Ext () : any {
            // @ts-ignore
            return this.window.Ext
        }


        compToEl (comp : ExtComponent) : Element {
            // const Ext       = this.Ext

            if (comp.getEl) {
                const extEl     = comp.getEl()

                return extEl?.dom
            }
        }


        componentIsHidden (comp : ExtComponent) : boolean {
            const el        = this.compToEl(comp)

            if (!el) return true

            return (comp.isVisible && !comp.isVisible()) || !isElementPointReachable(el, null, true)
        }


        cq (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : Element[] {
            return this.componentQuery(query, root, options)
        }


        cq1 (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : Element {
            return this.componentQuery(query, root, options)[ 0 ]
        }


        componentQuery (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : Element[] {
            const selector  = query.replace(/^(\s*>>)?/, '').trim()

            const results   = root.query(selector)

            return options?.ignoreNonVisible
                ? results.filter(comp => this.componentIsHidden(comp))
                : results
        }


        compositeQuery (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : Element[] {
            const parts         = query.split(/\s*=>\s*/)

            if (parts.length < 2 || parts.length > 2) throw new Error("Composite query should contain a single `=>` delimeter")

            const [ compSelector, domSelector ] = parts

            const components    = this.componentQuery(compSelector, root, { ignoreNonVisible : options?.ignoreNonVisible ?? false })

            return components.flatMap(comp => {
                const compEl        = this.compToEl(comp)

                return compEl ? this.querySingleContext(domSelector, compEl) : []
            })
        }


        override querySingleContext (query : string, root : Element | Document = this.window.document) : Element[] {
            if (query.match(/=>/)) {
                return this.Ext
                    ? this.compositeQuery(query, this.Ext.ComponentQuery)
                    : []
            }
            else if (query.match(/>>/)) {
                return this.Ext
                    ? this.componentQuery(query, this.Ext.ComponentQuery, { ignoreNonVisible : false })
                        .map(comp => this.compToEl(comp))
                        .filter(el => Boolean(el))
                    : []
            } else
                return super.querySingleContext(query, root)
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const api = createTestSectionConstructors(TestSencha)

/**
 * Alias for {@link TestSencha.it | it} method.
 */
export const it = api.it

/**
 * Alias for {@link TestSencha.iit | iit} method.
 */
export const iit = api.iit

/**
 * Alias for {@link TestSencha.xit | xit} method.
 */
export const xit = api.xit

/**
 * Alias for {@link TestSencha.describe | describe} method.
 */
export const describe = api.describe

/**
 * Alias for {@link TestSencha.ddescribe | ddescribe} method.
 */
export const ddescribe = api.ddescribe

/**
 * Alias for {@link TestSencha.xdescribe | xdescribe} method.
 */
export const xdescribe = api.xdescribe
