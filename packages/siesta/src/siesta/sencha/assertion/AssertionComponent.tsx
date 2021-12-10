import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
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
                    assertionName       : 'waitForComponentVisible',
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
                    const result    = this.componentQuery(target, opts.root)

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
                    const result    = this.componentQuery(target, opts.root)

                    return result.length === 0 ? result : null
                },
                reporting : {
                    assertionName       : 'waitForComponentQuery',
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
    }
) {}



