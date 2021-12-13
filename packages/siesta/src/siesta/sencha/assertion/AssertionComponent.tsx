import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { WaitForResult } from "../../../util/TimeHelpers.js"
import { isFunction, isString } from "../../../util/Typeguards.js"
import { isElementPointReachable } from "../../../util_browser/Dom.js"
import { WaitForOptions } from "../../test/assertion/AssertionAsync.js"
import { ExtComponent, TestSenchaPre } from "../TestSenchaPre.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * This type excludes the `condition` property from the [[WaitForOptions]] type and adds `target`
 *
 * It is used in the [[waitForComponentVisible]], [[waitForComponentNotVisible]] methods.
 */
export type WaitForComponentOptions = Omit<WaitForOptions<ExtComponent>, 'condition'> & {
    /**
     * Either an `Ext.Component` instance or a component query string.
     */
    target      : string | ExtComponent

    /**
     * The optional root component in which the query should be resolved
     */
    root        : ExtComponent
}


/**
 * This type excludes the `condition` property from the [[WaitForOptions]] type and adds `target`
 *
 * It is used in the [[waitForComponentVisible]] method.
 */
export type WaitForComponentQueryOptions = Omit<WaitForOptions<ExtComponent>, 'condition'> & {
    /**
     * A component query string to wait for
     */
    target      : string

    /**
     * The optional root component in which the query should be resolved
     */
    root        : ExtComponent
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionComponent extends Mixin(
    [ TestSenchaPre ],
    (base : ClassUnion<typeof TestSenchaPre>) =>

    class AssertionComponent extends base {

        /**
         * Waits until the main element of the passed component becomes "reachable" in the DOM.
         * This means at least some part of the element should be within the currently visible viewport
         * and the center of that part should be directly reachable by user (ie not hidden by some other
         * element).
         *
         * Returns a promise, which is resolved to the passed component instance (or result of the component query).
         *
         * This method may throw or issue a warning if passed component query is resolved to multiple elements and
         * [[onAmbiguousQuery]] config is set to the appropriate value.
         *
         * @param options Either a component query string, Ext.Component instance or [[WaitForComponentOptions]] options.
         * If provided as a component query, this method will additionally wait for the query to resolve to at least one
         * component.
         */
        async waitForComponentVisible (
            options : string | ExtComponent | Partial<WaitForComponentOptions>, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent>
        {
            const target    = isString(options) || this.isExtComponent(options) ? options : options.target
            const opts      = isString(options) || this.isExtComponent(options) ? {} : options

            if (!isString(target) && !this.isExtComponent(target)) throw new Error("Invalid input for `waitForComponentVisible")

            let warned : boolean        = false

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const components    = this.resolveExtComponentAll(target, opts.root)

                    if (!warned) warned = this.warnAmbiguousComponentQuery(components)
                    if (components.length === 0) return null

                    const el        = this.compToEl(components[ 0 ])

                    return el && isElementPointReachable(el, undefined, true).reachable ? components[ 0 ] : null
                },
                reporting : {
                    assertionName       : 'waitForComponentVisible',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            Waited too long for the element of component { target } to become reachable
                        </div>,
                    onConditionMet      : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the element of component { target } to become reachable
                        </div>,
                    onException         : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            <div>Exception thrown while checking for component visibility</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<ExtComponent>, timeout != null ? { timeout } as WaitForOptions<ExtComponent> : null))
        }


        /**
         * Waits until the passed component becomes hidden, as defined by its `hidden` property.
         *
         * Returns a promise, which is resolved to the passed component instance (or result of the component query).
         *
         * This method may throw or issue a warning if passed component query is resolved to multiple elements and
         * [[onAmbiguousQuery]] config is set to the appropriate value.
         *
         * @param options Either a component query string, Ext.Component instance or [[WaitForComponentOptions]] options.
         * If provided as a component query, this method will additionally wait for the query to resolve to at least one
         * component.
         */
        async waitForComponentNotVisible (
            options : string | ExtComponent | Partial<WaitForComponentOptions>, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent>
        {
            const target    = isString(options) || this.isExtComponent(options) ? options : options.target
            const opts      = isString(options) || this.isExtComponent(options) ? {} : options

            if (!isString(target) && !this.isExtComponent(target)) throw new Error("Invalid input for `waitForComponentVisible")

            let warned : boolean        = false

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const components    = this.resolveExtComponentAll(target, opts.root)

                    if (!warned) warned = this.warnAmbiguousComponentQuery(components)
                    if (components.length === 0) return null

                    return this.componentIsHidden(components[ 0 ]) ? components[ 0 ] : null
                },
                reporting : {
                    assertionName       : 'waitForComponentNotVisible',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            Waited too long for the element of component { target } to become not visible
                        </div>,
                    onConditionMet      : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the element of component { target } to become not visible
                        </div>,
                    onException         : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            <div>Exception thrown while checking for component visibility</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<ExtComponent>, timeout != null ? { timeout } as WaitForOptions<ExtComponent> : null))
        }


        /**
         * Waits until the passed component query is resolved to at least one component.
         *
         * Returns a promise, which is resolved to the result of the query.
         *
         * The "root" argument of this method can be omitted.
         *
         * @param options The component query selector or [[WaitForComponentQueryOptions]] object
         * @param root The container to start a component query from. Optional
         */
        async waitForComponentQuery (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            // no `root` supplied
            if (isFunction(root)) {
                // @ts-ignore
                timeout     = scope
                scope       = callback
                callback    = root
                root        = undefined
            }

            const target    = isString(options) ? options : options.target
            const opts      = isString(options) ? {} as Partial<WaitForComponentQueryOptions> : options

            if (!isString(target)) throw new Error("Invalid input for `waitForComponentQuery")

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const result    = this.componentQuery(target, root ?? opts.root)

                    return result.length > 0 ? result : null
                },
                reporting : {
                    assertionName       : 'waitForComponentQuery',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            Waited too long for the component query { target } to return at least one component
                        </div>,
                    onConditionMet      : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the component query { target } to return at least one component
                        </div>,
                    onException         : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            <div>Exception thrown while resolving the component query { target }</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<ExtComponent[]>, timeout != null ? { timeout } as WaitForOptions<ExtComponent[]> : null))
        }


        /**
         * Waits until the passed component query is resolved to empty array.
         *
         * Returns a promise, which is resolved to the result of the query.
         *
         * The "root" argument of this method can be omitted.
         *
         * @param options The component query selector or [[WaitForComponentQueryOptions]] object
         * @param root The container to start a component query from. Optional
         */
        async waitForComponentQueryNotFound (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            // no `root` supplied
            if (isFunction(root)) {
                // @ts-ignore
                timeout     = scope
                scope       = callback
                callback    = root
                root        = undefined
            }

            const target    = isString(options) ? options : options.target
            const opts      = isString(options) ? {} as Partial<WaitForComponentQueryOptions> : options

            if (!isString(target)) throw new Error("Invalid input for `waitForComponentQuery")

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const result    = this.componentQuery(target, root ?? opts.root)

                    return result.length === 0 ? result : null
                },
                reporting : {
                    assertionName       : 'waitForComponentQueryNotFound',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            Waited too long for the component query { target } to return empty array
                        </div>,
                    onConditionMet      : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the component query { target } to return empty array
                        </div>,
                    onException         : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            <div>Exception thrown while resolving the component query { target }</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<ExtComponent[]>, timeout != null ? { timeout } as WaitForOptions<ExtComponent[]> : null))
        }


        /**
         * Waits until the passed composite query is resolved to at least one DOM element.
         *
         * Returns a promise, which is resolved to the result of the query.
         *
         * The "root" argument of this method can be omitted.
         *
         * @param options The component query selector or [[WaitForComponentQueryOptions]] object
         * @param root The container to start a component query from. Optional
         */
        async waitForCompositeQuery (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<Element[]>
        {
            // no `root` supplied
            if (isFunction(root)) {
                // @ts-ignore
                timeout     = scope
                scope       = callback
                callback    = root
                root        = undefined
            }

            const target    = isString(options) ? options : options.target
            const opts      = isString(options) ? {} as Partial<WaitForComponentQueryOptions> : options

            if (!isString(target)) throw new Error("Invalid input for `waitForComponentQuery")

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const result    = this.compositeQuery(target, root ?? opts.root)

                    return result.length > 0 ? result : null
                },
                reporting : {
                    assertionName       : 'waitForCompositeQuery',
                    onTimeout           : (waitRes : WaitForResult<Element[]>, waitOptions : WaitForOptions<Element[]>) =>
                        <div>
                            Waited too long for the composite query { target } to return at least one DOM element
                        </div>,
                    onConditionMet      : (waitRes : WaitForResult<Element[]>, waitOptions : WaitForOptions<Element[]>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the composite query { target } to return at least one DOM element
                        </div>,
                    onException         : (waitRes : WaitForResult<Element[]>, waitOptions : WaitForOptions<Element[]>) =>
                        <div>
                            <div>Exception thrown while resolving the composite query { target }</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<Element[]>, timeout != null ? { timeout } as WaitForOptions<Element[]> : null))
        }


        /**
         * Waits until the passed composite query is resolved to empty array.
         *
         * Returns a promise, which is resolved to the result of the query.
         *
         * The "root" argument of this method can be omitted.
         *
         * @param options The composite query selector or [[WaitForComponentQueryOptions]] object
         * @param root The container to start a composite query from. Optional
         */
        async waitForCompositeQueryNotFound (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<Element[]>
        {
            // no `root` supplied
            if (isFunction(root)) {
                // @ts-ignore
                timeout     = scope
                scope       = callback
                callback    = root
                root        = undefined
            }

            const target    = isString(options) ? options : options.target
            const opts      = isString(options) ? {} as Partial<WaitForComponentQueryOptions> : options

            if (!isString(target)) throw new Error("Invalid input for `waitForComponentQuery")

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const result    = this.compositeQuery(target, root ?? opts.root)

                    return result.length === 0 ? result : null
                },
                reporting : {
                    assertionName       : 'waitForCompositeQueryNotFound',
                    onTimeout           : (waitRes : WaitForResult<Element[]>, waitOptions : WaitForOptions<Element[]>) =>
                        <div>
                            Waited too long for the component query { target } to return empty array
                        </div>,
                    onConditionMet      : (waitRes : WaitForResult<Element[]>, waitOptions : WaitForOptions<Element[]>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the component query { target } to return empty array
                        </div>,
                    onException         : (waitRes : WaitForResult<Element[]>, waitOptions : WaitForOptions<Element[]>) =>
                        <div>
                            <div>Exception thrown while resolving the component query { target }</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<Element[]>, timeout != null ? { timeout } as WaitForOptions<Element[]> : null))
        }


        /**
         * Alias for [[waitForComponentQuery]]
         *
         * @param options
         * @param root
         * @param callback
         * @param scope
         * @param timeout
         */
        async waitForCQ (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            return this.waitForComponentQuery(options, root, callback, scope, timeout)
        }


        /**
         * Alias for [[waitForComponentQueryNotFound]]
         *
         * @param options
         * @param root
         * @param callback
         * @param scope
         * @param timeout
         */
        async waitForCQNotFound (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        ) {
            return this.waitForComponentQueryNotFound(options, root, callback, scope, timeout)
        }


        /**
         * Alias for [[waitForComponentQueryVisible]]
         *
         * @param options
         * @param root
         * @param callback
         * @param scope
         * @param timeout
         */
        async waitForCQVisible (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            return this.waitForComponentQueryVisible(options, root, callback, scope, timeout)
        }

        /**
         * Alias for [[waitForComponentQueryNotVisible]]
         *
         * @param options
         * @param root
         * @param callback
         * @param scope
         * @param timeout
         */
        async waitForCQNotVisible (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            return this.waitForComponentQueryNotVisible(options, root, callback, scope, timeout)
        }


        /**
         * Waits until all results of the `Ext.ComponentQuery` are detected and visible.
         * The visibility criteria in this assertion is that component should be rendered and its main element
         * has non-empty bounding rectangle (as returned by the [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) method.
         * Note, that element still may be not visible on the screen, because it can be scrolled out of the viewport.
         * This is different from the [[waitForComponentVisible]] method.
         *
         * This assertion is useful, when you need to determine that many components are rendered and physically
         * present in the DOM.
         *
         * Returns a promise, which is resolved to the result of the query.
         *
         * The "root" argument of this method can be omitted.
         *
         * @param options The component query selector or [[WaitForComponentQueryOptions]] object
         * @param root The container to start a component query from. Optional
         */
        async waitForComponentQueryVisible (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            // no `root` supplied
            if (isFunction(root)) {
                // @ts-ignore
                timeout     = scope
                scope       = callback
                callback    = root
                root        = undefined
            }

            const target    = isString(options) ? options : options.target
            const opts      = isString(options) ? {} as Partial<WaitForComponentQueryOptions> : options

            if (!isString(target)) throw new Error("Invalid input for `waitForComponentQuery")

            let firstNonVisibleId
            let resultsLen : number

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const result    = this.componentQuery(target, root ?? opts.root)
                    resultsLen      = result.length

                    for (const comp of result)
                        if (this.componentIsHidden(comp)) { firstNonVisibleId = comp.id; return null }

                    return resultsLen === 0 ? null : result
                },
                reporting : {
                    assertionName       : 'waitForComponentQueryVisible',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) => {
                        if (resultsLen === 0)
                            return <div>
                                Waited too long for the component query { target } to return non-empty array
                            </div>
                        else
                            return <div>
                                Waited too long for the component query { target } to return array of visible components.
                                The matching component [id={ firstNonVisibleId }] is not visible
                            </div>
                    },
                    onConditionMet      : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the component query { target } to return non-empty array of visible components
                        </div>,
                    onException         : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            <div>Exception thrown while resolving and checking for visibility the component query { target }</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<ExtComponent[]>, timeout != null ? { timeout } as WaitForOptions<ExtComponent[]> : null))
        }


        /**
         * `Ext.ComponentQuery` is either empty, or the found component(s) is not visible.
         * See the [[waitForComponentQueryVisible]] for the visibility criteria.
         *
         * Returns a promise, which is resolved to the result of the query.
         *
         * The "root" argument of this method can be omitted.
         *
         * @param options The component query selector or [[WaitForComponentQueryOptions]] object
         * @param root The container to start a component query from. Optional
         */
        async waitForComponentQueryNotVisible (
            options : string | Partial<WaitForComponentQueryOptions>, root? : ExtComponent, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent[]>
        {
            // no `root` supplied
            if (isFunction(root)) {
                // @ts-ignore
                timeout     = scope
                scope       = callback
                callback    = root
                root        = undefined
            }

            const target    = isString(options) ? options : options.target
            const opts      = isString(options) ? {} as Partial<WaitForComponentQueryOptions> : options

            if (!isString(target)) throw new Error("Invalid input for `waitForComponentQuery")

            let firstVisibleId

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const result    = this.componentQuery(target, root ?? opts.root)

                    for (const comp of result)
                        if (!this.componentIsHidden(comp)) { firstVisibleId = comp.id; return null }

                    return result
                },
                reporting : {
                    assertionName       : 'waitForComponentQueryNotVisible',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) => {
                        return <div>
                            Waited too long for the component query { target } to return array of visible components.
                            The matching component [id={ firstVisibleId }] is visible
                        </div>
                    },
                    onConditionMet      : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for the component query { target } to return non-empty array of visible components
                        </div>,
                    onException         : (waitRes : WaitForResult<ExtComponent[]>, waitOptions : WaitForOptions<ExtComponent[]>) =>
                        <div>
                            <div>Exception thrown while resolving and checking for visibility the component query { target }</div>
                            <div>{ String(waitRes.exception) }</div>
                        </div>
                }
            } as WaitForOptions<ExtComponent[]>, timeout != null ? { timeout } as WaitForOptions<ExtComponent[]> : null))
        }
    }
) {}



