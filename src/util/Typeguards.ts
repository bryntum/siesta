import { AnyFunction } from "../class/Mixin.js"
import { typeOf } from "./Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export const isFunction = (a : any) : a is AnyFunction => {
    return typeOf(a) === 'Function'
}

//---------------------------------------------------------------------------------------------------------------------
export const isNumber = (a : any) : a is number => {
    return Number(a) === a
}
