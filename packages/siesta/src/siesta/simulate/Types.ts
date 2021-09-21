//---------------------------------------------------------------------------------------------------------------------
export type Point                   = [ x : number, y : number ]

export type MouseButton             = 'left' | 'right' | 'middle'

export type ActionTarget            = Element | string | Point | []

// export type ActionTargetElement     = Element | string | Point | []

export type ActionTargetOffset      = [ dx : number | string, dy : number | string ]

// export type ActionTarget            = ActionTargetElement | { target : ActionTargetElement, offset : ActionTargetOffset } | (() => ActionTarget)
//
// export type ActionTargetNormalized  = ActionTargetElement | { target : ActionTargetElement, offset : ActionTargetOffset }


// export class ActionTargetData extends Base {
//     target : ActionTargetElement    = undefined
//     offset : ActionTargetOffset     = undefined
// }


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


// //---------------------------------------------------------------------------------------------------------------------
// export const normalizeActionTarget    = (actionTarget : ActionTarget) : ActionTargetNormalized => {
//     let target      = actionTarget
//
//     while (isFunction(target)) target = target()
//
//     return target
// }


//---------------------------------------------------------------------------------------------------------------------
export const sumPoints      = (point1 : Point, point2 : Point) : Point =>
    [ point1[ 0 ] + point2[ 0 ], point1[ 1 ] + point2[ 1 ] ]

//---------------------------------------------------------------------------------------------------------------------
export const sumPoints3     = (point1 : Point, point2 : Point, point3 : Point) : Point =>
    [ point1[ 0 ] + point2[ 0 ] + point3[ 0 ], point1[ 1 ] + point2[ 1 ] + point3[ 1 ] ]

//---------------------------------------------------------------------------------------------------------------------
export const minusPoints    = (point1 : Point, point2 : Point) : Point =>
    [ point1[ 0 ] - point2[ 0 ], point1[ 1 ] - point2[ 1 ] ]

//---------------------------------------------------------------------------------------------------------------------
export const equalPoints    = (point1 : Point, point2 : Point) : boolean =>
    point1[ 0 ] === point2[ 0 ] && point1[ 1 ] === point2[ 1 ]
