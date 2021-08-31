import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { isArray, isFunction, isString } from "../../util/Typeguards.js"
import { clientXtoPageX, clientYtoPageY } from "../../util_browser/Coordinates.js"
import { Simulator } from "./Simulator.js"
import { ActionTarget, ActionTargetElement, ActionTargetOffset, MouseButton, normalizeActionTarget, Point } from "./Types.js"

//---------------------------------------------------------------------------------------------------------------------
export type MouseActionOptions      = {
    target      : ActionTarget,
    offset      : ActionTargetOffset,
    button      : MouseButton,
    callback    : Function,
    scope       : any
}


//---------------------------------------------------------------------------------------------------------------------
export interface UserAgent {
    click (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : Promise<any>

    rightClick (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : Promise<any>

    doubleClick (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : Promise<any>

    mouseDown (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : Promise<any>

    mouseUp (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : Promise<any>

    mouseMove (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : Promise<any>
}



//---------------------------------------------------------------------------------------------------------------------
// user agent for Siesta's on-page tests

export class UserAgentOnPage extends Mixin(
    [],
    (base : ClassUnion) =>

    class UserAgentOnPage extends base implements UserAgent {

        window              : Window        = undefined

        simulator           : Simulator     = undefined


        resolveActionTarget (action : MouseActionOptions) : Point {
            const target        = action.target

            if (target instanceof Array) {
                if (target.length === 0)
                    return this.getCursorPagePosition()
                else
                    return target
            }
            else if (target instanceof Element) {

            }
            else {
                target
            }
        }


        resolveQuery (query : string) : NodeListOf<Element> {
            return this.window.document.querySelectorAll(query)
        }


        normalizeMouseActionOptions (targetOrOptions : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : MouseActionOptions {
            if (isFunction(targetOrOptions) || isString(targetOrOptions) || isArray(targetOrOptions) || (targetOrOptions instanceof Element)) {
                return {
                    target      : normalizeActionTarget(targetOrOptions),
                    offset      : offset,
                    button      : 'left',

                    callback    : undefined,
                    scope       : undefined
                }
            } else {
                return Object.assign({
                    target      : undefined,
                    offset      : undefined,
                    button      : 'left',

                    callback    : undefined,
                    scope       : undefined
                } as MouseActionOptions, targetOrOptions)
            }
        }


        getCursorPagePosition () : Point {
            return [
                clientXtoPageX(this.simulator.currentPosition[ 0 ], this.window),
                clientYtoPageY(this.simulator.currentPosition[ 1 ], this.window)
            ]
        }


        async click (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {
            const action        = this.normalizeMouseActionOptions(target, offset)

            const targetPoint   = this.resolveActionTarget(action)

            await this.simulator.click(targetPoint, { button : action.button })
        }


        async rightClick (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }


        async doubleClick (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }


        async mouseDown (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {
        }


        async mouseUp (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {
        }


        async mouseMove (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
// this is user agent for classic browser automation tests,
// where the test itself is running in the OS process (like Node.js)
// and it operates on the browser page, usually using `page.evaluate()`
// this is how Puppeteer, Playwright and Selenium works

// idea is that the user actions API should be identical
export class UserAgentExternal extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class UserAgentExternal extends base implements UserAgent {

        simulator           : Simulator     = undefined


        async click (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }


        async rightClick (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }


        async doubleClick (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }


        async mouseDown (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {
        }


        async mouseUp () {

        }


        async mouseMove (target : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {

        }
    }
) {}

