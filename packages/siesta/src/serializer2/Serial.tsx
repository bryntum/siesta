import { Base } from "../class/Base.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { SerializationMapEntry } from "../serializer/SerializerRendering.js"
import { dateToString } from "../serializer/SerializerXml.js"
import { ArbitraryObject, isAtomicValue, typeOf } from "../util/Helpers.js"
import { isDate, isFunction } from "../util/Typeguards.js"
import { FuzzyMatcher } from "../compare_deep/DeepDiffFuzzyMatcher.js"
import {
    SerialObjectEntry,
    Serial,
    SerialArray,
    SerialAtomic, serializeAtomic,
    SerialObject,
    SerialReferenceable, SerialSet,
    SerialWrapper, SerialMap, SerialMapEntry, SerialOutOfBreadth
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

    // if (state.depth > options.maxDepth) return SerialOutOfDepth.new()

    const matchersDiff  = serializeFuzzyMatchers(v1, options, state)

    if (matchersDiff) return matchersDiff

    const v1Visit       = state.visited.get(v1)

    const hasPrevious1  = v1Visit !== undefined

    if (hasPrevious1) {
        let refId1  = v1Visit[ 1 ].refId

        if (refId1 === undefined) refId1 = v1Visit[ 1 ].refId = state.refIdSource++

        // return SerialReference.new({
        //     value1  : v1Visit[ 1 ].refId1,
        //     value2  : v2Visit[ 1 ].refId2,
        //     $same   : v1Visit[ 0 ] === v2Visit[ 0 ]
        // })
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
    // else if (type1 === 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
    //     return compareFunctionDeepDiff(v1 as Function, v2 as Function, options, state, convertingToDiff)
    // }
    // else if (type1 === 'RegExp') {
    //     return compareRegExpDeepDiff(v1 as RegExp, v2 as RegExp, options, state, convertingToDiff)
    // }
    // else if (type1 === 'Date') {
    //     return compareDateDeepDiff(v1 as Date, v2 as Date, options, state, convertingToDiff)
    // }
    // else if (type1 === 'Error') {
    //     return compareErrorDeepDiff(v1 as Error, v2 as Error, options, state, convertingToDiff)
    // }
    // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer
    else {
        return SerialAtomic.new({
            value      : v1
        })
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


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// const compareErrorDeepDiff = function (
//     object1 : Error, object2 : Error,
//     options : SerialOptions, state : SerialState, convertingToDiff : 'value1' | 'value2' | undefined
// )
//     : Serial
// {
//     const difference = DifferenceObject.new({ value1 : object1, value2 : object2 })
//
//     state.markVisited(object1, object2, difference, convertingToDiff)
//
//     const { common, onlyIn1, onlyIn2 }  = compareKeys(
//         new Set(Object.keys(object1)), new Set(Object.keys(object2)), false, options, state, convertingToDiff
//     )
//
//     common.push({ el1 : 'message', el2 : 'message', difference : null })
//
//     difference.onlyIn2Size              = onlyIn2.size
//
//     for (let i = 0; i < common.length; i++) {
//         const key1      = common[ i ].el1
//         const key2      = common[ i ].el2
//
//         const diff      = serialImpl(object1[ key1 ], object2[ key2 ], options, state, convertingToDiff)
//
//         difference.addComparison(key1, diff)
//     }
//
//     onlyIn1.forEach(key1 => difference.addComparison(key1, valueAsDifference(object1[ key1 ], 'value1', options, state)))
//     onlyIn2.forEach(key2 => difference.addComparison(key2, valueAsDifference(object2[ key2 ], 'value2', options, state)))
//
//     return difference
// }
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// const compareFunctionDeepDiff = function (
//     func1 : Function, func2 : Function,
//     options : SerialOptions, state : SerialState, convertingToDiff : 'value1' | 'value2' | undefined
// ) : Difference Serial
//     const difference = DifferenceReferenceableAtomic.new({ value1 : func1, value2 : func2, $same : func1 === func2 })
//
//     state.markVisited(func1, func2, difference, convertingToDiff)
//
//     return difference
// }
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// const compareRegExpDeepDiff = function (
//     regexp1 : RegExp, regexp2 : RegExp,
//     options : SerialOptions, state : SerialState, convertingToDiff : 'value1' | 'value2' | undefined
// ) : Difference Serial
//     const regexpProps   = [ 'source', 'dotAll', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode' ]
//
//     const difference    = DifferenceReferenceableAtomic.new({
//         value1  : regexp1,
//         value2  : regexp2,
//
//         $same   : regexpProps.every(propertyName => regexp1[ propertyName ] === regexp2[ propertyName])
//     })
//
//     state.markVisited(regexp1, regexp2, difference, convertingToDiff)
//
//     return difference
// }
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// const compareDateDeepDiff = function (
//     date1 : Date, date2 : Date,
//     options : SerialOptions, state : SerialState, convertingToDiff : 'value1' | 'value2' | undefined
// ) : Difference Serial
//     const difference = DifferenceReferenceableAtomic.new({ value1 : date1, value2 : date2, $same : date1.getTime() === date2.getTime() })
//
//     if (!options.compareDateByValue) state.markVisited(date1, date2, difference, convertingToDiff)
//
//     return difference
// }


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const serializeFuzzyMatchers = function (
    v1                  : unknown,
    options             : SerialOptions,
    state               : SerialState,
)
    : Serial | undefined
{
    // const v1IsMatcher   = v1 instanceof FuzzyMatcher
    //
    // if (v1IsMatcher) {
    //     return (v1 as FuzzyMatcher).equalsToDiff(v2, false, options, state, convertingToDiff)
    // }
    // else if (v2IsMatcher && !v1IsMatcher) {
    //     return (v2 as FuzzyMatcher).equalsToDiff(v1, true, options, state, convertingToDiff)
    // }

    return undefined
}
