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

//---------------------------------------------------------------------------------------------------------------------
export const isString = (a : any) : a is string => {
    return typeOf(a) === 'String'
}

//---------------------------------------------------------------------------------------------------------------------
export const isArray = (a : any) : a is unknown[] => {
    return typeOf(a) === 'Array'
}

//---------------------------------------------------------------------------------------------------------------------
export const isRegExp = (a : any) : a is RegExp => {
    return typeOf(a) === 'RegExp'
}
