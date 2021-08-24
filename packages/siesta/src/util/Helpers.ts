import { AnyConstructor } from "../class/Mixin.js"
import { CI } from "../iterator/Iterator.js"

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
export const constructorNameOf = (value : any) : string => {
    const proto = Object.getPrototypeOf(value)

    return proto ? proto.constructor.name : typeOf(value)
}


//---------------------------------------------------------------------------------------------------------------------
export type PartialWOC<T>       = Omit<Partial<T>, 'constructor'>


//---------------------------------------------------------------------------------------------------------------------
export type OrPromise<T>        = T | Promise<T>

export type UnwrapPromise<T>    = T extends Promise<infer P> ? P : T

//---------------------------------------------------------------------------------------------------------------------
export type ArbitraryObjectKey  = string | number | symbol

export type ArbitraryObject<T = unknown>     =  { [ key in ArbitraryObjectKey ] : T }


//---------------------------------------------------------------------------------------------------------------------
// the reason of this fancy typing instead of plain:
//     export type SetTimeoutHandler   = ReturnType<typeof setTimeout>
//     export type SetIntervalHandler  = ReturnType<typeof setInterval>
// is that when generating declaration files, the type are inlined
// and `SetTimeoutHandler` becomes `NodeJS.Timeout`
// in addition a `/// reference types="node"` directive is added
// so that user of the package receives dependency on `@types/node`
// export interface SetTimeoutHandler extends ReturnType<typeof setTimeout> {}
// export interface SetIntervalHandler extends ReturnType<typeof setInterval> {}

// the trick above actually did not work, fall back to `any`

export type SetTimeoutHandler   = any
export type SetIntervalHandler  = any


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
export const awaitDomReady = async () : Promise<void> => {
    if (document.readyState === 'complete') return

    await new Promise<Event>(resolve => window.addEventListener('load', resolve, { once : true }))
}

//---------------------------------------------------------------------------------------------------------------------
export const awaitDomInteractive = async () : Promise<void> => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') return

    await new Promise<void>(resolve => {
        document.addEventListener(
            'readystatechange',
            () => {
                if (document.readyState === 'interactive' || document.readyState === 'complete') resolve()
            },
            { once : true }
        )
    })
}



//---------------------------------------------------------------------------------------------------------------------
// TODO review whats the difference with native `String.matchAll()` and possibly remove, not supported everywhere?
export const matchAll = function* (regexp : RegExp, testStr : string) : Generator<string[]> {
    let match : string[]

    while ((match = regexp.exec(testStr)) !== null) {
        yield match
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

export const isDeno = function () : boolean {
    return globalThis.Deno !== undefined && Boolean(globalThis.Deno.build)
}


//---------------------------------------------------------------------------------------------------------------------
export const saneSplit = (str : string, split : string | RegExp) : string[] => str === '' ? [] : str.split(split)


// export const stripFirstNewLine = (str : TemplateStringsArray, ...insertions : string[]) : string =>
//     str.map(
//         (string, index) => (index === 0 ? string.replace(/^n/, '') : string) + (index < insertions.length ? insertions[ index ] : '')
//     ).join('')

//---------------------------------------------------------------------------------------------------------------------
export const randomElement = <V>(array : V[]) : V => array[ Math.floor(array.length * Math.random()) ]
export const lastElement = <V>(array : V[]) : V | undefined => array[ array.length - 1 ]

export type NonEmptyArray<T>    = [ T, ...T[] ]

//---------------------------------------------------------------------------------------------------------------------
export const escapeRegExp = (source : string) : string => source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')


//---------------------------------------------------------------------------------------------------------------------
export const objectEntriesDeep = <T extends unknown>(source : { [ key in ArbitraryObjectKey ] : T }) : [ ArbitraryObjectKey, T ][] => {
    const res : [ ArbitraryObjectKey, T ][]   = []

    for (const key in source) res.push([ key, source[ key ] ])

    return res
}


//---------------------------------------------------------------------------------------------------------------------
export const cloneObject = <O extends object>(object : O) : O => {
    const newObject = Object.create(Object.getPrototypeOf(object))

    return Object.assign(newObject, object)
}
