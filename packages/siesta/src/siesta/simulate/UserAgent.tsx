import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { Logger } from "../../logger/Logger.js"
import { waitFor } from "../../util/TimeHelpers.js"
import { isArray, isString } from "../../util/Typeguards.js"
import { clientXtoPageX, clientYtoPageY } from "../../util_browser/Coordinates.js"
import { isElementVisible } from "../../util_browser/Dom.js"
import { Test } from "../test/Test.js"
import { Assertion } from "../test/TestResult.js"
import { Simulator } from "./Simulator.js"
import { ActionTarget, ActionTargetOffset, MouseButton, Point, sumPoints } from "./Types.js"

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

const defaultNormalizeElementOptions    = { warnOnMultiple : true }

export class UserAgentOnPage extends Mixin(
    [ Test ],
    (base : ClassUnion<typeof Test>) =>

    class UserAgentOnPage extends base implements UserAgent {

        window              : Window        = window

        simulator           : Simulator     = undefined


        get defaultTimeout () : number {
            throw new Error("Abstract method called")
        }


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


        normalizeElement (el : string | Element, options : { warnOnMultiple : boolean } = defaultNormalizeElementOptions) : Element | undefined {
            if (isString(el)) {
                const resolved      = this.query(el)

                if (resolved.length > 1 && options.warnOnMultiple) {
                    this.warn(`Query resolved to multiple elements: ${ el }`)
                }

                return resolved[ 0 ]
            } else {
                return el
            }
        }


        query (query : string) : Element[] {
            return Array.from(this.window.document.querySelectorAll(query))
        }


        normalizeMouseActionOptions (targetOrOptions : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) : MouseActionOptions {
            if (isString(targetOrOptions) || isArray(targetOrOptions) || (targetOrOptions instanceof Element)) {
                return {
                    target      : targetOrOptions,
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


        waitForTarget


        async click (targetInfo : ActionTarget | MouseActionOptions, offset? : ActionTargetOffset) {
            const action        = this.normalizeMouseActionOptions(targetInfo, offset)

            const target        = action.target

            const targetIsPoint = isArray(target)

            if (!isArray(target)) {
                const el        = this.normalizeElement(target)

                const waitRes   = await waitFor(() => isElementVisible(el), this.defaultTimeout, 15)

                if (!waitRes.conditionIsMet) {
                    this.addResult(Assertion.new({
                        name        : 'waitForElementVisible',
                        passed      : false,
                        annotation  : <div>
                            Waited too long for click target <span>{ target }</span> to become visible
                        </div>
                    }))

                    return
                }
            }


            const targetPoint   = this.resolveActionTarget(action)

            const simulatorOffset   = this.simulator.offset

            console.log("CLICKING TEST", targetPoint, simulatorOffset)

            await this.simulator.simulateClick(sumPoints(targetPoint, simulatorOffset), { button : action.button })
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
            const action            = this.normalizeMouseActionOptions(target, offset)

            const targetPoint       = this.resolveActionTarget(action)

            const simulatorOffset   = this.simulator.offset

            await this.simulator.simulateMouseMove(sumPoints(targetPoint, simulatorOffset))
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

