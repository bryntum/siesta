import { AnyConstructor } from "../class/Mixin.js"
import { CI } from "../collection/Iterator.js"

//---------------------------------------------------------------------------------------------------------------------
// assume 32-bit platform (https://v8.dev/blog/react-cliff)
// Note - can not use: expression like: -Math.pow(2, 30) - v8 does not recognize it as SMI
export const MIN_SMI = -1073741824
export const MAX_SMI = 1073741823


//---------------------------------------------------------------------------------------------------------------------
export const identity = <V>(value : V) : V => value


//---------------------------------------------------------------------------------------------------------------------
export type Equality = (v1 : unknown, v2 : unknown) => boolean

export const strictEquality : Equality = <V>(v1 : V, v2 : V) : boolean => v1 === v2


//---------------------------------------------------------------------------------------------------------------------
export const uppercaseFirst = (str : string) : string => str.slice(0, 1).toUpperCase() + str.slice(1)


//---------------------------------------------------------------------------------------------------------------------
export const isAtomicValue = (value : any) : boolean => Object(value) !== value


//---------------------------------------------------------------------------------------------------------------------
export const typeOf = (value : any) : string => Object.prototype.toString.call(value).slice(8, -1)

//---------------------------------------------------------------------------------------------------------------------
export const constructorNameOf = (value : any) : string => Object.getPrototypeOf(value).constructor.name

//---------------------------------------------------------------------------------------------------------------------
export type PartialWOC<T>       = Omit<Partial<T>, 'constructor'>

//---------------------------------------------------------------------------------------------------------------------
export type OrPromise<T>        = T | Promise<T>

//---------------------------------------------------------------------------------------------------------------------
export type ArbitraryObjectKey  = string | number | symbol

export type ArbitraryObject     =  { [ key in ArbitraryObjectKey ] : unknown }

//---------------------------------------------------------------------------------------------------------------------
export type SetTimeoutHandler   = ReturnType<typeof setTimeout>
export type SetIntervalHandler  = ReturnType<typeof setInterval>


//---------------------------------------------------------------------------------------------------------------------
export const isSubclassOf = (baseclass : AnyConstructor, superclass : AnyConstructor) : boolean => {
    return superclass.prototype.isPrototypeOf(baseclass.prototype)
}


//---------------------------------------------------------------------------------------------------------------------
export const isSuperclassOf = (superclass : AnyConstructor, baseclass : AnyConstructor) : boolean => {
    return superclass.prototype.isPrototypeOf(baseclass.prototype)
}


//---------------------------------------------------------------------------------------------------------------------
export const defineProperty = <T extends object, S extends keyof T>(target : T, property : S, value : T[ S ]) : T[ S ] => {
    Object.defineProperty(target, property, { value, enumerable : true, configurable : true })

    return value
}


//---------------------------------------------------------------------------------------------------------------------
export const prototypeValue = (value : any) : PropertyDecorator => {

    return function (target : object, propertyKey : string | symbol) : void {
        target[ propertyKey ] = value
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const copyMapInto = <K, V>(sourceMap : Map<K, V>, targetMap : Map<K, V>) : Map<K, V> => {
    for (const [ key, value ] of sourceMap) targetMap.set(key, value)

    return targetMap
}


//---------------------------------------------------------------------------------------------------------------------
export const copySetInto = <V>(sourceSet : Set<V>, targetSet : Set<V>) : Set<V> => {
    for (const value of sourceSet) targetSet.add(value)

    return targetSet
}


//---------------------------------------------------------------------------------------------------------------------
export const delay = (timeout : number) : Promise<any> => new Promise(resolve => setTimeout(resolve, timeout))


//---------------------------------------------------------------------------------------------------------------------
export const matchAll = function* (regexp : RegExp, testStr : string) : Generator<string[]> {
    let match : string[]

    while ((match = regexp.exec(testStr)) !== null) {
        yield match
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const allMatches = function (regexp : RegExp, testStr : string) : string[] {
    return CI(matchAll(regexp, testStr)).map(match => CI(match).drop(1)).concat().toArray()
}


//---------------------------------------------------------------------------------------------------------------------
declare const regeneratorRuntime : any

let isRegeneratorRuntime : boolean | null = null

export const isGeneratorFunction = function (func : any) : boolean {
    if (isRegeneratorRuntime === null) isRegeneratorRuntime = typeof regeneratorRuntime !== 'undefined'

    if (isRegeneratorRuntime === true) {
        return regeneratorRuntime.isGeneratorFunction(func)
    } else {
        return func.constructor.name === 'GeneratorFunction'
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const isNodejs = function () : boolean {
    return typeof process !== 'undefined'
        && process.release && process.release.name === 'node'
        && typeof global !== 'undefined'
        // @ts-ignore
        && typeof window === 'undefined'
}


//---------------------------------------------------------------------------------------------------------------------
export const saneSplit = function (str : string, split : string | RegExp) : string[] {
    if (str === '') return []

    return str.split(split)
}

