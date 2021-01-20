import { AnyFunction } from "../class/Mixin.js"
import { typeOf } from "./Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export const isFunction = (a : any) : a is AnyFunction => typeOf(a) === 'Function'

export const isNumber = (a : any) : a is number => Number(a) === a

export const isString = (a : any) : a is string => typeOf(a) === 'String'

export const isArray = (a : any) : a is unknown[] => typeOf(a) === 'Array'

export const isRegExp = (a : any) : a is RegExp => typeOf(a) === 'RegExp'

export const isDate = (a : any) : a is Date => typeOf(a) === 'Date'
