import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { WaitForResult } from "../../../util/TimeHelpers.js"
import { isString } from "../../../util/Typeguards.js"
import { isElementPointReachable } from "../../../util_browser/Dom.js"
import { WaitForOptions } from "../../test/assertion/AssertionAsync.js"
import { ExtComponent, TestSenchaPre } from "../TestSenchaPre.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type WaitForComponentQueryOptions = Omit<WaitForOptions<any>, 'condition'> & {
    target      : string | ExtComponent
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionComponent extends Mixin(
    [ TestSenchaPre ],
    (base : ClassUnion<typeof TestSenchaPre>) =>

    class AssertionComponent extends base {

        /**
         * Waits until the main element of the passed component becomes "reachable" in the DOM. The callback will receive the passed component instance.
         *
         * @param {Ext.Component/String} component An Ext.Component instance or a ComponentQuery string. In the latter case,
         * this method will also wait until the component query find some component (meaning the component does not have to
         * be already created when waiting starts)
         * @param {Function} callback The callback to call after the component becomes visible
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        async waitForComponentVisible (
            options : string | ExtComponent | Partial<WaitForComponentQueryOptions>, callback : AnyFunction, scope : object, timeout : number
        )
            : Promise<ExtComponent>
        {
            const target    = isString(options) || this.isExtComponent(options) ? options : options.target
            const opts      = isString(options) || this.isExtComponent(options) ? {} : options

            if (!isString(target) && !this.isExtComponent(target)) throw new Error("Invalid input for `waitForComponentVisible")

            return await this.waitFor(Object.assign(opts, {
                condition           : () => {
                    const comp      = this.resolveExtComponent(target)
                    if (!comp) return null

                    const el        = this.compToEl(comp)

                    return el && isElementPointReachable(el, null, true) ? comp : null
                },
                reporting : {
                    assertionName       : 'waitForComponentVisible',
                    onTimeout           : (waitRes : WaitForResult<ExtComponent>, waitOptions : WaitForOptions<ExtComponent>) =>
                        <div>
                            Waited too long for the element of component { target } to become reachable
                        </div>,
                    onConditionMet
                }



                // callback        : callback,
                // scope           : scope,
                // timeout         : timeout,
                // assertionName   : 'waitForComponentVisible',
                // description     : ' ' + R.get('component') + ' "' + (me.typeOf(component) == 'String' ? component : component.id) + '" ' + R.get('toBeVisible')
            } as WaitForOptions<ExtComponent>))
        }
    }
) {}



