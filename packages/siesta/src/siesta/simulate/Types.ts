import { Base } from "../../class/Base.js"
import { isFunction } from "../../util/Typeguards.js"

//---------------------------------------------------------------------------------------------------------------------
export type Point                   = [ number, number ]

export type MouseButton             = 'left' | 'right' | 'middle'

export type ActionTargetElement     = Element | string | Point | []

export type ActionTargetOffset      = [ number | string, number | string ]

export type ActionTarget            = ActionTargetElement | { target : ActionTargetElement, offset : ActionTargetOffset } | (() => ActionTarget)

export type ActionTargetNormalized  = ActionTargetElement | { target : ActionTargetElement, offset : ActionTargetOffset }


export class ActionTargetData extends Base {
    target : ActionTargetElement    = undefined
    offset : ActionTargetOffset     = undefined
}


//---------------------------------------------------------------------------------------------------------------------
export const normalizeActionTarget    = (actionTarget : ActionTarget) : ActionTargetNormalized => {
    let target      = actionTarget

    while (isFunction(target)) target = target()

    return target
}
