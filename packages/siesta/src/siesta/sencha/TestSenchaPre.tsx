import { AnyFunction } from "typescript-mixin-class"
import { TextJSX } from "../../jsx/TextJSX.js"
import { serializeToElement } from "../../serializer/Serial.js"
import { prototypeValue } from "../../util/Helpers.js"
import { waitFor, WaitForResult } from "../../util/TimeHelpers.js"
import { isString } from "../../util/Typeguards.js"
import { isElementAccessible } from "../../util_browser/Dom.js"
import { ActionTarget } from "../simulate/Types.js"
import { TestBrowser } from "../test/TestBrowser.js"
import { Assertion } from "../test/TestResult.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// dummy types for better signatures
/**
 * This type denotes the Ext.Observable instance.
 * Its not a real type with all properties, only used to improve the code readability.
 */
export type ExtObservable       = { addListener : AnyFunction, removeListener : AnyFunction }

/**
 * This type denotes the Ext.Component instance.
 * Its not a real type with all properties, only used to improve the code readability.
 */
export type ExtComponent        = Record<string, any> & ExtObservable

/**
 * This type denotes the Ext.Element instance.
 * Its not a real type with all properties, only used to improve the code readability.
 */
export type ExtElement          = { dom : Element } & ExtObservable

export const isComponentQuery = (selector : string) : boolean => Boolean(selector.match(/^\s*>>/))

export const isExtComponent = (a : any, Ext) : a is ExtComponent => Boolean(Ext && (a instanceof Ext.Component))

/**
 * This type extends the [[ActionTarget]] with the extra options for Sencha framework.
 * Notably, it accepts the `Ext.Component/Ext.Element` instances.
 *
 * Also, the semantic of string selector is extended with [[componentQuery|component query]] and [[compositeQuery|composite query]].
 */
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

    /**
     * This accessor provides an `Ext` global, from the test's context.
     */
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

                //                                                    Ext6 Modern               Ext6.7                                       Ext7             Fallback
                return comp.el.down('.x-form-field') || comp.el.down('.x-field-input') || comp.el.down('.x-input-el') || comp.inputEl || comp.inputElement || comp.el
            }

            //                                                         Ext 7
            if (comp instanceof Ext.form.Field && (comp.inputEl || comp.inputElement)) {
                let field       = comp.el.down('.x-form-field')

                return (field && field.dom) ? field : (comp.inputEl || comp.inputElement)
            }

            if (Ext.form.HtmlEditor && comp instanceof Ext.form.HtmlEditor) {
                //     Ext JS 3       Ext JS 4
                return comp.iframe || comp.inputEl || comp.inputElement
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

    /**
     * An alias for the [[componentQuery]] method.
     *
     * @param query
     * @param root
     * @param options
     *
     * @category Sencha: Querying
     */
    cq (
        query : string,
        root : ExtComponent = this.Ext.ComponentQuery,
        options? : {
            /**
             * Whether to ignore the non-visible components
             */
            ignoreNonVisible : boolean
        }
    ) : ExtComponent[] {
        return this.componentQuery(query, root, options)
    }


    /**
     * An alias for the [[componentQuery]] method which returns the 1st element of the results array
     * (or `null` if the component query does not match any components).
     *
     * @param query
     * @param root
     * @param options
     *
     * @category Sencha: Querying
     */
    cq1 (
        query : string,
        root : ExtComponent = this.Ext.ComponentQuery,
        options? : {
            /**
             * Whether to ignore the non-visible components
             */
            ignoreNonVisible : boolean
        }
    ) : ExtComponent | null {
        return this.componentQuery(query, root, options)[ 0 ] ?? null
    }


    /**
     * This methods performs a component query (`Ext.ComponentQuery.query()`) in the ExtJS components tree.
     *
     * Component query selector is distinguished from the regular CSS selector by the leading `>>` symbol:
     * ```js
     * await t.click('>>panel[title=My Panel]')
     * ```
     * Such query is resolved to the main elements of the matching components.
     *
     * The `>>` symbol is optional when calling this method, however it is mandatory when using other methods
     * (like [[query]], [[click]] etc) and inside [[ActionTargetSencha]].
     * This is to be able to distinguish the component query from CSS query.
     *
     * @param query A regular ExtJS component query. May have a `>>` prefix, which will be trimmed.
     * @param root A root component to start the query from.
     * @param options
     *
     * @category Sencha: Querying
     */
    componentQuery (
        query : string,
        root : ExtComponent = this.Ext.ComponentQuery,
        options? : {
            /**
             * Whether to ignore the non-visible components
             */
            ignoreNonVisible : boolean
        }
    ) : ExtComponent[] {
        const selector  = query.replace(/^(\s*>>)?/, '').trim()

        const results   = root.query(selector)

        return options?.ignoreNonVisible
            ? results.filter(comp => this.componentIsHidden(comp))
            : results
    }


    /**
     * This method performs a *composite query*. This query is distinguished from the regular CSS query by the presence of
     * the `=>` separator.
     *
     * This symbol splits the query into 2 parts (hence the name) - the 1st part is a component query and 2nd -
     * a regular CSS query. First, the component query is performed, then - the CSS query inside the main elements
     * of all matching components.
     *
     * ```js
     * await t.click('panel[title=My Panel] => .my-class')
     * ```
     * Such query is resolved to the DOM elements, matching the CSS query (2nd part) inside the main elements of components,
     * matching the component query (1st part).
     *
     * @param query
     * @param root
     * @param options
     *
     * @category Sencha: Querying
     */
    compositeQuery (
        query : string,
        root : ExtComponent = this.Ext.ComponentQuery,
        options? : {
            /**
             * Whether to ignore the non-visible components
             */
            ignoreNonVisible : boolean
        }
    ) : Element[] {
        const parts         = query.split(/\s*=>\s*/)

        if (parts.length < 2 || parts.length > 2) throw new Error("Composite query should contain a single `=>` delimeter")

        const [ compSelector, domSelector ] = parts

        const components    = this.componentQuery(compSelector, root, { ignoreNonVisible : options?.ignoreNonVisible ?? false })

        return components.flatMap(comp => {
            const compEl        = this.compToEl(comp)

            return compEl ? this.querySingleContext(domSelector, compEl) : []
        })
    }


    /**
     * This method extends the [[TestBrowser.query]] functionality with Sencha-specific querying.
     *
     * Notably, the [[componentQuery|component query]] and [[compositeQuery|composite query]] are supported.
     *
     * For example:
     * ```js
     * const res = t.query('>>panel[title=My Panel]')
     * const res = t.query('panel[title=My Panel] => .my-class')
     * ```
     *
     * @category Dom helper methods
     *
     * @param query
     * @param root
     */
    override query (query : string, root : Element | Document = this.window.document) : Element[] {
        return super.query(query, root)
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

                        <div class="indented">{ serializeToElement(results[ 0 ]) }</div>
                    </div>
                    : <div>
                        Component query <span class="underlined">{ query }</span> did not match any component
                    </div>
        }))
    }


    /**
     * Alias for [[componentQueryExists]]
     *
     * @param query
     * @param description
     *
     * @category Sencha: Querying
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
     * Alias for [[componentQueryNotExists]]
     *
     * @param query
     * @param description
     *
     * @category Sencha: Querying
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
     *
     * @category Sencha: Querying
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
     * This assertion passes if the provided component query does not match any components.
     *
     * @param query
     * @param description
     *
     * @category Sencha: Querying
     */
    componentQueryNotExists (query : string, description? : string) {
        this.assertComponentQueryExistsInternal(
            'componentQueryNotExists',
            !this.isAssertionNegated,
            query,
            description
        )
    }


    override async setupRootTest () {
        await super.setupRootTest()

        const Ext       = this.Ext
        const toWait : { desc : string, promise : Promise<WaitForResult<boolean>> }[]         = []

        if (Ext) {
            if (this.descriptor.waitForExtReady) {
                let extReady                = false
                let onReadyWaitingStarted   = false

                toWait.push({
                    desc        : 'waitForExtReady',
                    promise     : waitFor(() => {
                        if (onReadyWaitingStarted) {
                            return extReady
                        }
                        else if (Ext.onReady) {
                            onReadyWaitingStarted   = true
                            Ext.onReady(() => extReady = true)
                        }
                        else
                            return false
                    }, this.waitForTimeout, this.waitForPollInterval)
                })
            }

            if (this.descriptor.waitForAppReady) {
                const name      = Ext.manifest.name

                toWait.push({
                    desc        : 'waitForAppReady',
                    promise     : waitFor(() => {
                        try {
                            // @ts-ignore
                            return Boolean(this.window[ name ].getApplication().launched)
                        } catch (e) {
                            return false
                        }
                    }, this.waitForTimeout, this.waitForPollInterval)
                })
            }
        }

        const waitResults   = await Promise.all(toWait.map(w => w.promise))

        for (let i = 0; i < waitResults.length; i++) {
            if (!waitResults[ i ].conditionIsMet)
                this.addResult(Assertion.new({
                    name        : toWait[ i ].desc,
                    passed      : false,
                    description : `Waiting for the \`${ toWait[ i ].desc }\` took too long. Timeout is ${ this.waitForTimeout }ms`
                }))
        }
    }
}
