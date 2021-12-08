import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { prototypeValue } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { isElementPointReachable } from "../../util_browser/Dom.js"
import { ActionTarget } from "../simulate/Types.js"
import { createTestSectionConstructors } from "../test/Test.js"
import { TestBrowser } from "../test/TestBrowser.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// dummy type for better signatures
export type ExtComponent        = any

export const isComponentQuery = (selector : string) : boolean => Boolean(selector.match(/^\s*>>/))

export const isExtComponent = (a : any, Ext) : a is ExtComponent => Boolean(Ext && (a instanceof Ext.Component))


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


        addListenerToObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
            const Ext     = this.Ext

            if (Ext && isExtComponent(observable, Ext)) {
                observable.addListener(event, listener)
            } else
                super.addListenerToObservable(observable, event, listener)
        }


        removeListenerFromObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
            const Ext     = this.Ext

            if (Ext && isExtComponent(observable, Ext)) {
                observable.removeListener(event, listener)
            } else
                super.addListenerToObservable(observable, event, listener)
        }


        resolveObservable (source : ActionTarget) : Element | ExtComponent {
            if (isString(source) && isComponentQuery(source)) {
                const components    = this.componentQuery(source)

                if (components.length > 1) {
                    if (this.onAmbiguousQuery === 'warn')
                        this.warn(`Query for observable resolved to multiple components: ${ components }`)
                    else if (this.onAmbiguousQuery === 'throw')
                        throw new Error(`Query resolved to multiple elements: ${ components }`)
                }

                return components[ 0 ]
            } else {
                const Ext       = this.Ext

                if (Ext && (source instanceof Ext.Component))
                    return source
                else
                    return super.resolveObservable(source)
            }
        }


        get Ext () : any {
            // @ts-ignore
            return this.window.Ext
        }


        compToEl (comp : ExtComponent, locateInputEl = true) : Element {
            if (!comp) return null

            const Ext         = this.Ext

            // Handle editors, deal with the field directly
            if (Ext.Editor && comp instanceof Ext.Editor && comp.field) {
                comp        = comp.field
            }

            // Ext JS
            if (Ext && Ext.form && Ext.form.Field && locateInputEl) {
                // Deal with bizarre markup in Ext 5.1.2+
                if (
                    (Ext.form.Checkbox && comp instanceof Ext.form.Checkbox || Ext.form.Radio && comp instanceof Ext.form.Radio)
                    && comp.el
                ) {
                    let displayEl   = comp.displayEl

                    if (displayEl && comp.boxLabel) {
                        return displayEl
                    }

                    let inputComponent  = Ext.ComponentQuery.query('checkboxinput', comp)[ 0 ]

                    if (inputComponent) return this.compToEl(inputComponent)

                    //                                                    Ext6 Modern               Ext6.7                                   Fallback
                    return comp.el.down('.x-form-field') || comp.el.down('.x-field-input') || comp.el.down('.x-input-el') || comp.inputEl || comp.el
                }

                if (comp instanceof Ext.form.Field && comp.inputEl) {
                    let field       = comp.el.down('.x-form-field')

                    return (field && field.dom) ? field : comp.inputEl
                }

                if (Ext.form.HtmlEditor && comp instanceof Ext.form.HtmlEditor) {
                    //     Ext JS 3       Ext JS 4
                    return comp.iframe || comp.inputEl
                }
            }

            if (Ext && Ext.field && Ext.field.Slider && (comp instanceof Ext.field.Slider)) {
                return this.compToEl(Ext.ComponentQuery.query('slider', comp)[ 0 ])
            }

            // Sencha Touch: Form fields can have a child input component
            if (Ext && Ext.field && Ext.field.Field && comp instanceof Ext.field.Field && locateInputEl && comp.getComponent) {
                comp        = comp.getComponent()

                // some of the SenchaTouch fields uses "masks" - another DOM element, which is applied
                // on top of the field when it does not have focus
                // some of them have mask always ("useMask === true"), for such fields return mask element
                // as its the primary point of user interaction
                if (comp.getUseMask && comp.getUseMask() === true && comp.mask) return comp.mask

                if (locateInputEl && comp.input) return comp.input

                if (comp.bodyElement) return comp.bodyElement
            }

            //                      Ext JS   vs                    Sencha Touch
            return comp.getEl && !comp.element ? comp.getEl() : locateInputEl && comp.input || comp.el || comp.element
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
            else if (isComponentQuery(query)) {
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
