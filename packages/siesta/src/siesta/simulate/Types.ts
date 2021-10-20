import { isArray, isString } from "../../util/Typeguards.js"
import { isHTMLElement, isSVGElement } from "../../util_browser/Typeguards.js"
import { SimulatorKeyboard } from "./SimulatorKeyboard.js"
import { SimulatorMouse } from "./SimulatorMouse.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * This type represent a 2-dimensional point, as a tuple (array with 2 elements)
 */
export type Point                   = [ x : number, y : number ]

/**
 * This type represent mouse button.
 */
export type MouseButton             = 'left' | 'right' | 'middle'

/**
 * This union type represent action target for various user-action simulation methods.
 *
 * It can be:
 * - a native DOM `Element`
 * - a `string`, which contains a CSS query to be resolved. The [[TestDescriptorBrowser.onAmbiguousQuery]] controls
 * the behavior if a query is resolved to multiple elements.
 * - a [[Point]] on the screen, with the coordinates in the
 * [client](https://developer.mozilla.org/en-US/docs/Web/CSS/CSSOM_View/Coordinate_systems#client) coordinate system.
 * - an empty array - equivalent of the point with current cursor location.
 *
 * For example:
 *
 * ```javascript
 * await t.click(document.body)
 * await t.click('body .css-class')
 * await t.click([ 100, 200 ])
 * await t.click([])
 * ```
 */
export type ActionTarget            = Element | string | Point | []

/**
 * The offset for the action point. It should be a 2-elements array with either exact offsets (number)
 * or "offset expressions" (string).
 *
 * The expression consists from "percentage" part and "fixed" part and should have the following syntax:
 * ```
 * '50% + 10'
 * '50% - 10'
 * ```
 */
export type ActionTargetOffset      = [ dx : number | string, dy : number | string ]

// export type ActionTarget            = ActionTargetElement | { target : ActionTargetElement, offset : ActionTargetOffset } | (() => ActionTarget)
//
// export type ActionTargetNormalized  = ActionTargetElement | { target : ActionTargetElement, offset : ActionTargetOffset }


// export class ActionTargetData extends Base {
//     target : ActionTargetElement    = undefined
//     offset : ActionTargetOffset     = undefined
// }

export const isActionTarget         = (a : any) : a is ActionTarget =>
    isString(a) || isArray(a) || isHTMLElement(a) || isSVGElement(a)


export type ActionableCheck         =
    // query did not return any results
    | 'present'
    // the element given is not connected to DOM (standalone, orphan element not yet added to dom)
    | 'connected'
    // "display : none", "visibility : hidden" or width/height === 0
    | 'accessible'
    // element's bounding rect is outside of the visible viewport area
    | 'visible'
    // the bounding rect of the element remains the same for 2 consequent animation frames
    | 'stable'
    // 1) the action offset point of the element is a top one, or is covered with a child element
    // 2) mouse cursor is not yet at the action point
    | 'reachable'


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export const normalizeActionTarget    = (actionTarget : ActionTarget) : ActionTargetNormalized => {
//     let target      = actionTarget
//
//     while (isFunction(target)) target = target()
//
//     return target
// }


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const sumPoints      = (point1 : Point, point2 : Point) : Point =>
    [ point1[ 0 ] + point2[ 0 ], point1[ 1 ] + point2[ 1 ] ]

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const sumPoints3     = (point1 : Point, point2 : Point, point3 : Point) : Point =>
    [ point1[ 0 ] + point2[ 0 ] + point3[ 0 ], point1[ 1 ] + point2[ 1 ] + point3[ 1 ] ]

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const minusPoints    = (point1 : Point, point2 : Point) : Point =>
    [ point1[ 0 ] - point2[ 0 ], point1[ 1 ] - point2[ 1 ] ]

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const equalPoints    = (point1 : Point, point2 : Point) : boolean =>
    point1[ 0 ] === point2[ 0 ] && point1[ 1 ] === point2[ 1 ]


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Simulator extends SimulatorMouse, SimulatorKeyboard {
}

