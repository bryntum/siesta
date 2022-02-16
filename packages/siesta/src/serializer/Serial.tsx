import { Base } from "../class/Base.js"
import { FuzzyMatcher } from "../compare_deep/DeepDiffFuzzyMatcher.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { ArbitraryObject, constructorNameOf, isAtomicValue, typeOf } from "../util/Helpers.js"
import {
    Serial,
    SerialArray,
    SerialAtomic,
    SerialElement,
    serializeAtomic,
    SerialMap,
    SerialMapEntry,
    SerialObject,
    SerialObjectEntry,
    SerialOutOfBreadth,
    SerialOutOfDepth,
    SerialReference,
    SerialReferenceable,
    SerialReferenceableAtomic,
    SerialSet,
    SerialWrapper
} from "./SerialRendering.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const Missing    = Symbol('Missing')
export type Missing     = typeof Missing



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialState extends Base {
    depth           : number                    = 0

    idSource        : number                    = 1

    refIdSource     : number                    = 1

    visited         : Map<unknown, [ number, SerialReferenceable ]>  = new Map()


    markVisited (v1 : unknown, serial : SerialReferenceable) {
        const visitInfo     = [ this.idSource++, serial ] as [ number, SerialReferenceable ]

        const prevVisited1  = this.visited.get(v1)

        if (prevVisited1) {
            // save the latest visit id
            prevVisited1[ 0 ]       = visitInfo[ 0 ]

            // assign reference id if missing
            if (prevVisited1[ 1 ].refId === undefined) prevVisited1[ 1 ].refId = this.refIdSource++
        } else
            this.visited.set(v1, visitInfo)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type SerialOptions = {
    maxBreadth?     : number
    maxDepth?       : number
    includeFunctionSources? : boolean
}

const defaultSerialOptions : SerialOptions = {
    maxBreadth              : Number.MAX_SAFE_INTEGER,
    maxDepth                : Number.MAX_SAFE_INTEGER,
    includeFunctionSources  : true
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const serialize = (
    v1                  : unknown,
    opts                : SerialOptions    = defaultSerialOptions
)
    : SerialWrapper =>
{
    const options       = Object.assign({}, defaultSerialOptions, opts)

    return SerialWrapper.new({ serialization : serialImpl(v1, options) })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const serializeToElement = (
    v1                  : unknown,
    opts                : SerialOptions    = defaultSerialOptions
)
    : SerialElement => serialize(v1, opts).template()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const out = (state : SerialState, res : Serial) : Serial => {
    state.depth--

    return res
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serialImpl = function (
    v1                  : unknown,
    options             : SerialOptions,
    state               : SerialState      = SerialState.new()
)
    : Serial
{
    state.depth++

    // allow serialization of out-of-depth atomic values, since they are 1 line usually (except long strings)
    // and we show the out-of-depth symbol anyway
    if (!isAtomicValue(v1) && state.depth > options.maxDepth) return out(state, SerialOutOfDepth.new({ constructorName : constructorNameOf(v1) }))

    const matchersDiff  = serializeFuzzyMatchers(v1, options, state)

    if (matchersDiff) return out(state, matchersDiff)

    const v1Visit       = state.visited.get(v1)

    const hasPrevious1  = v1Visit !== undefined

    if (hasPrevious1) {
        let refId1  = v1Visit[ 1 ].refId

        if (refId1 === undefined) refId1 = v1Visit[ 1 ].refId = state.refIdSource++

        return out(state, SerialReference.new({
            value  : v1Visit[ 1 ].refId,
        }))
    }

    const type1         = typeOf(v1)

    if (type1 === 'Array') {
        return out(state, serializeArray(v1 as unknown[], options, state))
    }
    else if (type1 === 'Object') {
        return out(state, serializeObject(v1 as ArbitraryObject, options, state))
    }
    else if (type1 === 'Map') {
        return out(state, serializeMap(v1 as Map<unknown, unknown>, options, state))
    }
    else if (type1 === 'Set') {
        return out(state, serializeSet(v1 as Set<unknown>, options, state))
    }
    else if (type1 === 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
        return out(state, serializeFunction(v1 as Function, options, state))
    }
    else if (type1 === 'RegExp') {
        return out(state, serializeRegExp(v1 as RegExp, options, state))
    }
    else if (type1 === 'Date') {
        return out(state, serializeDate(v1 as Date, options, state))
    }
    else if (type1 === 'Error') {
        return out(state, serializeError(v1 as Error, options, state))
    }
    // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer
    else {
        return out(state, SerialAtomic.new({
            value      : v1
        }))
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeArray = function (
    array1 : unknown[], options : SerialOptions, state : SerialState
)
    : Serial
{
    const serial    = SerialArray.new({ value : array1 })

    state.markVisited(array1, serial)

    for (let i = 0; i < array1.length; i++) {
        if (i < options.maxBreadth)
            serial.entries.push(serialImpl(array1[ i ], options, state))
        else {
            serial.addEntry(SerialOutOfBreadth.new({ remains : array1.length - options.maxBreadth }))
            break
        }
    }

    return serial
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeSet = function (
    set1 : Set<unknown>, options : SerialOptions, state : SerialState
)
    : Serial
{
    const serial        = SerialSet.new({ value : set1 })

    state.markVisited(set1, serial)

    let i               = 0

    for (const el of set1) {
        if (i < options.maxBreadth)
            serial.entries.push(serialImpl(el, options, state))
        else {
            serial.addEntry(SerialOutOfBreadth.new({ remains : set1.size - options.maxBreadth }))
            break
        }
        i++
    }

    return serial
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeMap = function (
    map1 : Map<unknown, unknown>, options : SerialOptions, state : SerialState
)
    : Serial
{
    const serial        = SerialMap.new({ value : map1 })

    state.markVisited(map1, serial)

    let i               = 0

    for (const [ key, value ] of map1) {
        if (i < options.maxBreadth)
            serial.entries.push(SerialMapEntry.new({
                serialKeys      : serialImpl(key, options, state),
                serialization   : serialImpl(value, options, state)
            }))
        else {
            serial.entries.push(SerialOutOfBreadth.new({ remains : map1.size - options.maxBreadth }))
            break
        }
        i++
    }

    return serial
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeObject = function (
    object1 : ArbitraryObject, options : SerialOptions, state : SerialState
)
    : Serial
{
    const serial    = SerialObject.new({ value : object1 })

    state.markVisited(object1, serial)

    const keys      = Object.keys(object1)

    for (let i = 0; i < keys.length; i++) {
        if (i < options.maxBreadth) {
            const key1      = keys[ i ]

            serial.entries.push(SerialObjectEntry.new({
                key             : serializeAtomic(key1),
                serialization   : serialImpl(object1[ key1 ], options, state)
            }))
        }
        else {
            serial.entries.push(SerialOutOfBreadth.new({ remains : keys.length - options.maxBreadth }))
            break
        }
    }

    return serial
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeError = function (
    object1 : Error, options : SerialOptions, state : SerialState
)
    : Serial
{
    const serial = SerialObject.new({ value : object1 })

    state.markVisited(object1, serial)

    const keys      = new Set(Object.keys(object1))

    keys.add('message')

    let i           = 0

    for (const key of keys) {
        if (i < options.maxBreadth) {
            const key1      = keys[ i ]

            serial.entries.push(SerialObjectEntry.new({
                key             : serializeAtomic(key1),
                serialization   : serialImpl(object1[ key1 ], options, state)
            }))
        }
        else {
            serial.entries.push(SerialOutOfBreadth.new({ remains : keys.size - options.maxBreadth }))
            break
        }
        i++
    }

    return serial
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeFunction = function (
    func1 : Function, options : SerialOptions, state : SerialState
) : Serial {
    const difference = SerialReferenceableAtomic.new({ value : func1 })

    state.markVisited(func1, difference)

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeRegExp = function (
    regexp1 : RegExp, options : SerialOptions, state : SerialState
) : Serial {
    const regexpProps   = [ 'source', 'dotAll', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode' ]

    const difference    = SerialReferenceableAtomic.new({ value : regexp1 })

    state.markVisited(regexp1, difference)

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeDate = function (
    date1 : Date, options : SerialOptions, state : SerialState
) : Serial {
    const difference = SerialReferenceableAtomic.new({ value : date1 })

    state.markVisited(date1, difference)

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeFuzzyMatchers = function (
    v1                  : unknown,
    options             : SerialOptions,
    state               : SerialState,
)
    : Serial | undefined
{
    if (v1 instanceof FuzzyMatcher) {
        return SerialAtomic.new({ content : v1.toString(), typeOf : 'fuzzy-matcher' })
    }
    else
        return undefined
}
