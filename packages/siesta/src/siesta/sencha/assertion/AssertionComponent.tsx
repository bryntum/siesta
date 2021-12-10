import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { WaitForResult } from "../../../util/TimeHelpers.js"
import { isString } from "../../../util/Typeguards.js"
import { isElementPointReachable } from "../../../util_browser/Dom.js"
import { WaitForOptions } from "../../test/assertion/AssertionAsync.js"
import { ExtComponent, TestSenchaPre } from "../TestSenchaPre.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * This type excludes the `condition` property from the [[WaitForOptions]] type and adds `target`
 *
 * Target can be either an `Ext.Component` instance or a component query string.
 */
export type WaitForComponentQueryOptions = Omit<WaitForOptions<ExtComponent>, 'condition'> & {
    target      : string | ExtComponent
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionComponent extends Mixin(
    [ TestSenchaPre ],
    (base : ClassUnion<typeof TestSenchaPre>) =>

    class AssertionComponent extends base {

        /**
         * Waits until the main element of the passed component becomes "reachable" in the DOM.
         * Returns a promise, which is resolved to the passed component instance.
         *
         * @param options Either a component query string, Ext.Component instance or [[WaitForComponentQueryOptions]] options.
         * If provided as a component query, this method will additionally wait for the
         */
        async waitForComponentVisible (
            options : string | ExtComponent | Partial<WaitForComponentQueryOptions>, callback? : AnyFunction, scope? : object, timeout? : number
        )
            : Promise<ExtComponent>
        {
            const target    = isString(options) || this.isExtComponent(options) ? options : options.target
            const opts      = isString(options) || this.isExtComponent(options) ? {} : options

            if (!isString(target) && !this.isExtComponent(target)) throw new Error("Invalid input for `waitForComponentVisible")

            let warned : boolean        = false

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const components    = this.resolveExtComponentAll(target)

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
    }
) {}



