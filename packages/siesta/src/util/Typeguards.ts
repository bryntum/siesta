import { AnyFunction } from "../class/Mixin.js"
import { typeOf } from "./Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export const isFunction = (a : any) : a is AnyFunction => /Function$/.test(typeOf(a))

export const isSyncFunction = (a : any) : a is AnyFunction => typeOf(a) === 'Function'

export const isAsyncFunction = (a : any) : a is AnyFunction => typeOf(a) === 'AsyncFunction'

export const isGeneratorFunction = (a : any) : a is AnyFunction => typeOf(a) === 'GeneratorFunction'

export const isAsyncGeneratorFunction = (a : any) : a is AnyFunction => typeOf(a) === 'AsyncGeneratorFunction'

export const isNumber = (a : any) : a is number => Number(a) === a

export const isString = (a : any) : a is string => typeOf(a) === 'String'

export const isArray = (a : any) : a is unknown[] => typeOf(a) === 'Array'

export const isObject = (a : any) : a is unknown[] => typeOf(a) === 'Object'

export const isRegExp = (a : any) : a is RegExp => typeOf(a) === 'RegExp'

export const isDate = (a : any) : a is Date => typeOf(a) === 'Date'
