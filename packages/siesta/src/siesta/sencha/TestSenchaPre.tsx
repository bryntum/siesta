import { AnyFunction } from "typescript-mixin-class"
import { TextJSX } from "../../jsx/TextJSX.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { prototypeValue } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { isElementAccessible } from "../../util_browser/Dom.js"
import { ActionTarget } from "../simulate/Types.js"
import { TestBrowser } from "../test/TestBrowser.js"
import { Assertion } from "../test/TestResult.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// dummy types for better signatures
export type ExtObservable       = { addListener : AnyFunction, removeListener : AnyFunction }
export type ExtComponent        = Record<string, any> & ExtObservable
export type ExtElement          = { dom : Element } & ExtObservable

export const isComponentQuery = (selector : string) : boolean => Boolean(selector.match(/^\s*>>/))

export const isExtComponent = (a : any, Ext) : a is ExtComponent => Boolean(Ext && (a instanceof Ext.Component))

export type ActionTargetSencha  = ActionTarget | ExtComponent | ExtElement


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestSenchaPre extends TestBrowser {
    @prototypeValue(TestDescriptorSencha)
    testDescriptorClass     : typeof TestDescriptorSencha

    descriptor              : TestDescriptorSencha


    isExtComponent (cmp : any) : cmp is ExtComponent {
        const Ext       = this.Ext

        return Boolean(Ext && (cmp instanceof Ext.Component))
    }


    isExtElement (cmp : any) : cmp is ExtElement {
        const Ext       = this.Ext

        return Boolean(Ext && (cmp instanceof Ext.Element))
    }


    isActionTarget (a : any) : a is ActionTarget {
        const Ext       = this.Ext

        if (Ext && (a instanceof Ext.Component)) return true
        if (Ext && (a instanceof Ext.Element)) return true

        return super.isActionTarget(a)
    }


    addListenerToObservable (observable : unknown, event : string, listener : AnyFunction) {
        const Ext     = this.Ext

        if (Ext && isExtComponent(observable, Ext)) {
            observable.addListener(event, listener)
        } else
            super.addListenerToObservable(observable, event, listener)
    }


    removeListenerFromObservable (observable : unknown, event : string, listener : AnyFunction) {
        const Ext     = this.Ext

        if (Ext && isExtComponent(observable, Ext)) {
            observable.removeListener(event, listener)
        } else
            super.addListenerToObservable(observable, event, listener)
    }


    resolveActionTargetAll (target : ActionTargetSencha) : Element[] {
        if (this.isExtComponent(target)) {
            return [ this.compToEl(target) ]
        }
        else if (this.isExtElement(target)) {
            return [ target.dom ]
        }
        else {
            return super.resolveActionTargetAll(target)
        }
    }


    warnAmbiguousComponentQuery (components : ExtComponent[], onAmbiguousQuery : 'use_first' | 'warn' | 'throw' = this.onAmbiguousQuery) : boolean {
        if (components.length > 1) {
            if (onAmbiguousQuery === 'warn') {
                this.warn(`Component query resolved to multiple components: ${components}`)
                return true
            }
            else if (onAmbiguousQuery === 'throw')
                throw new Error(`Component query resolved to multiple components: ${ components }`)
        }

        return false
    }


    resolveExtComponent (source : string | ExtComponent, root? : ExtComponent, onAmbiguousQuery : 'use_first' | 'warn' | 'throw' = this.onAmbiguousQuery) : ExtComponent {
        const components    = this.resolveExtComponentAll(source, root)

        this.warnAmbiguousComponentQuery(components, onAmbiguousQuery)

        return components[ 0 ] ?? null
    }


    resolveExtComponentAll (source : string | ExtComponent, root? : ExtComponent) : ExtComponent[] {
        if (isString(source)) {
            const components    = this.componentQuery(source, root)

            return components
        } else {
            if (this.isExtComponent(source))
                return [ source ]
            else
                return []
        }
    }


    resolveObservable (source : ActionTarget | ExtComponent | ExtElement) : any {
        if (isString(source) && isComponentQuery(source)) {
            const component     = this.resolveExtComponent(source)

            if (component !== undefined) return component
        }

        return this.isExtElement(source)
            ? source.dom
            : this.isExtComponent(source)
                ? source
                : super.resolveObservable(source)
    }


    get Ext () : any {
        // @ts-ignore
        return this.window.Ext
    }


    compToEl (comp : ExtComponent, locateInputEl : boolean = true) : Element {
        return this.compToExtEl(comp, locateInputEl)?.dom
    }


    compToExtEl (comp : ExtComponent, locateInputEl : boolean = true) : ExtElement {
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

                if (inputComponent) return this.compToExtEl(inputComponent)

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
            return this.compToExtEl(Ext.ComponentQuery.query('slider', comp)[ 0 ])
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

        return (comp.isVisible && !comp.isVisible()) || !isElementAccessible(el)
    }


    cq (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : ExtComponent[] {
        return this.componentQuery(query, root, options)
    }


    cq1 (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : ExtComponent | null {
        return this.componentQuery(query, root, options)[ 0 ] ?? null
    }


    componentQuery (query : string, root : ExtComponent = this.Ext.ComponentQuery, options? : { ignoreNonVisible : boolean }) : ExtComponent[] {
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
                ? this.compositeQuery(query, this.Ext.ComponentQuery, { ignoreNonVisible : false })
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


    assertComponentQueryExistsInternal (
        assertionName   : string,
        negated         : boolean,
        query           : string,
        description     : string = ''
    ) {
        const results       = this.cq(query)
        const passed        = negated ? results.length === 0 : results.length > 0

        this.addResult(Assertion.new({
            name            : negated ? this.negateAssertionName(assertionName) : assertionName,
            passed,
            description,
            annotation      : passed
                ? undefined
                : negated
                    ? <div>
                        Component query <span class="underlined">{ query }</span> match { results.length } component(s).{'\n'}

                        <div class="indented">{ SerializerXml.serialize(results[ 0 ]) }</div>
                    </div>
                    : <div>
                        Component query <span class="underlined">{ query }</span> did not match any component
                    </div>
        }))
    }


    /**
     * This assertion passes if the provided component query matches at least one component.
     *
     * @param query
     * @param description
     */
    cqExists (query : string, description? : string) {
        this.assertComponentQueryExistsInternal(
            'cqExists',
            this.isAssertionNegated,
            query,
            description
        )
    }


    /**
     * This assertion passes if the provided component query does not match any components.
     *
     * @param query
     * @param description
     */
    cqNotExists (query : string, description? : string) {
        this.assertComponentQueryExistsInternal(
            'cqNotExists',
            !this.isAssertionNegated,
            query,
            description
        )
    }


    /**
     * This assertion passes if the provided component query matches at least one component.
     *
     * @param query
     * @param description
     */
    componentQueryExists (query : string, description? : string) {
        this.assertComponentQueryExistsInternal(
            'componentQueryExists',
            this.isAssertionNegated,
            query,
            description
        )
    }

    /**
     * Sets a value to an Ext Component. A faster way to set a value than manually calling "type" into
     * a text field for example. A value is set by calling either the `setChecked` or `setRawValue` or
     * `setValue` method of the component.
     *
     * @param component A component instance or a component query to resolve
     * @param value
     */
    setValue (component : ExtComponent | string, value : unknown) {
        component = this.resolveExtComponent(component);

        // semi-colon needed
        (component.setChecked || component.setRawValue || component.setValue).call(component, value)
    }
}