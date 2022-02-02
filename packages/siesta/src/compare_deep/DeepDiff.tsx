import { Base } from "../class/Base.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { ArbitraryObject, isAtomicValue, typeOf } from "../util/Helpers.js"
import {
    Difference,
    DifferenceArray,
    DifferenceAtomic,
    DifferenceHeterogeneous,
    DifferenceMap,
    DifferenceObject,
    DifferenceReference,
    DifferenceReferenceable,
    DifferenceSet
} from "./DeepDiffRendering.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const Missing    = Symbol('Missing')
export type Missing     = typeof Missing

// a replacer for `Missing` - to render the diff for internal diff data structures correctly
const MissingInternal   = Symbol('Missing')

const diffTypeOf        = (a : unknown) : string => 'diff-' + typeOf(a).toLowerCase()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const valueAsDifference = (value : unknown, valueProp : 'value1' | 'value2', options : DeepCompareOptions, state : DeepCompareState) : Difference => {
    if (value === Missing) value = MissingInternal

    const difference = compareDeepDiff(value, value, options, state, valueProp)

    difference.excludeValue(valueProp === 'value1' ? 'value2' : 'value1')

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DeepCompareState extends Base {
    idSource        : number                    = 1

    refIdSource1    : number                    = 1
    refIdSource2    : number                    = 1

    visited1        : Map<unknown, [ number, DifferenceReferenceable ]>  = new Map()
    visited2        : Map<unknown, [ number, DifferenceReferenceable ]>  = new Map()


    markVisited (v1 : unknown, v2 : unknown, difference : DifferenceReferenceable, convertingToDiff : 'value1' | 'value2' | undefined) {
        const visitInfo     = [ this.idSource++, difference ] as [ number, DifferenceReferenceable ]

        if (convertingToDiff === undefined || convertingToDiff === 'value1') {
            const prevVisited1  = this.visited1.get(v1)

            if (prevVisited1) {
                // save the latest visit id
                prevVisited1[ 0 ]       = visitInfo[ 0 ]

                // assign reference id if missing
                if (prevVisited1[ 1 ].refId1 === undefined) prevVisited1[ 1 ].refId1 = this.refIdSource1++

                // save the "circular" id, indicating repeated visit to the data
                difference.circular1    = prevVisited1[ 1 ].refId1
            } else
                this.visited1.set(v1, visitInfo)
        }

        if (convertingToDiff === undefined || convertingToDiff === 'value2') {
            const prevVisited2  = this.visited2.get(v2)

            if (prevVisited2) {
                // see the comments above
                prevVisited2[ 0 ]       = visitInfo[ 0 ]
                if (prevVisited2[ 1 ].refId2 === undefined) prevVisited2[ 1 ].refId2 = this.refIdSource2++
                difference.circular2    = prevVisited2[ 1 ].refId2
            } else
                this.visited2.set(v2, visitInfo)
        }
    }


    in () : DeepCompareState {
        return DeepCompareState.new({
            idSource        : this.idSource,
            refIdSource1    : this.refIdSource1,
            refIdSource2    : this.refIdSource2,
            visited1        : new Map(this.visited1),
            visited2        : new Map(this.visited2)
        })
    }


    out (state : DeepCompareState) {
        this.idSource       = state.idSource
        this.refIdSource1   = state.refIdSource1
        this.refIdSource2   = state.refIdSource2
        this.visited1       = state.visited1
        this.visited2       = state.visited2
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DeepCompareOptions = {
    // none of these options are implemented yet
    omitEqual                   : boolean,
    // if `true` instances of difference classes will be considered different,
    // even if they contain the same properties
    requireSameClass            : boolean
    maxDifferences              : number,

    // implemented
    compareDateByValue          : boolean
}

const defaultDeepCompareOptions : DeepCompareOptions = {
    omitEqual                   : false,
    requireSameClass            : false,
    maxDifferences              : Number.MAX_SAFE_INTEGER,
    compareDateByValue          : true
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TODO should stop at 1st difference
export const equalDeep = (
    v1          : unknown,
    v2          : unknown,
    options     : DeepCompareOptions    = defaultDeepCompareOptions
) : boolean =>
    compareDeepDiff(v1, v2, options).same


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const compareDeepDiff = function (
    v1                  : unknown,
    v2                  : unknown,
    options             : DeepCompareOptions    = defaultDeepCompareOptions,
    state               : DeepCompareState      = DeepCompareState.new(),
    // this argument is used when some value is compared with itself, to convert it into a Difference instance
    // (which can be used for rendering later)
    convertingToDiff    : 'value1' | 'value2' | undefined = undefined
)
    : Difference
{
    // if we are passed the internal constant `Missing` to convert into `Difference`,
    // we are probably doing diff for own internal data structures (since it's not used anywhere else)
    // in such case, replace the `Missing` constant with another value,
    // so that code can distinguish it
    if (v1 === Missing) v1 = MissingInternal
    if (v2 === Missing) v2 = MissingInternal

    const matchersDiff  = compareFuzzyMatchersDeepDiff(v1, v2, options, state, convertingToDiff)

    if (matchersDiff) return matchersDiff

    if (convertingToDiff !== undefined) {
        const prevVisit     = state[ convertingToDiff === 'value1' ? 'visited1' : 'visited2' ].get(v1)
        const hasPrevious   = prevVisit !== undefined

        if (hasPrevious) {
            const refProp           = convertingToDiff === 'value1' ? 'refId1' : 'refId2'
            const refIdSourceProp   = convertingToDiff === 'value1' ? 'refIdSource1' : 'refIdSource2'

            let refId               = prevVisit[ 1 ][ refProp ]

            if (refId === undefined) refId = prevVisit[ 1 ][ refProp ] = state[ refIdSourceProp ]++
        }

        if (hasPrevious) {
            // special processing of the case, when a cyclic, already visited in a _single_ stream, value
            // is being converted to Difference with `valueAsDifference`
            // in such case the value in 2nd stream is actually missing
            if (convertingToDiff === 'value1')
                return DifferenceReference.new({ value1 : prevVisit[ 1 ].refId1 })
            else
                return DifferenceReference.new({ value2 : prevVisit[ 1 ].refId2 })
        }

    } else {
        const v1Visit   = state.visited1.get(v1)
        const v2Visit   = state.visited2.get(v2)

        const hasPrevious1      = v1Visit !== undefined

        if (hasPrevious1) {
            let refId1  = v1Visit[ 1 ].refId1

            if (refId1 === undefined) refId1 = v1Visit[ 1 ].refId1 = state.refIdSource1++
        }

        const hasPrevious2      = v2Visit !== undefined

        if (hasPrevious2) {
            let refId2  = v2Visit[ 1 ].refId2

            if (refId2 === undefined) refId2 = v2Visit[ 1 ].refId2 = state.refIdSource2++
        }

        const hasBothPrevious   = hasPrevious1 && hasPrevious2

        if (hasBothPrevious) {
            // cyclic visit from the same location in both data structures
            // this is considered as an equal value - the real difference
            // will be determined by the 1st visit
            return DifferenceReference.new({
                value1  : v1Visit[ 1 ].refId1,
                value2  : v2Visit[ 1 ].refId2,
                same    : v1Visit[ 0 ] === v2Visit[ 0 ]
            })
        }
        // if one day we decide to support the `cycleIsPartOfDataStructure` option
        // then we should return early here:
        //
        // const hasOnePrevious    = hasPrevious1 || hasPrevious2
        // else if (options.cycleIsPartOfDataStructure && hasOnePrevious) {
        //     if (hasPrevious1)
        //         return DifferenceHeterogeneous.new({
        //             value1      : DifferenceReference.new({ value1 : v1Visit[ 1 ].refId1 }),
        //             value2      : valueAsDifference(v2, 'value2', options, state)
        //         })
        //     else
        //         return DifferenceHeterogeneous.new({
        //             value1      : valueAsDifference(v1, 'value1', options, state),
        //             value2      : DifferenceReference.new({ value2 : v2Visit[ 1 ].refId2 }),
        //         })
        // }
    }

    const type1         = typeOf(v1)
    const type2         = typeOf(v2)

    if (type1 !== type2) {
        return DifferenceHeterogeneous.new({
            value1 : valueAsDifference(v1, 'value1', options, state),
            value2 : valueAsDifference(v2, 'value2', options, state)
        })
    }
    else if (type1 === 'Array') {
        return compareArrayDeepDiff(v1 as unknown[], v2 as unknown[], options, state, convertingToDiff)
    }
    else if (type1 === 'Object') {
        return compareObjectDeepDiff(v1 as ArbitraryObject, v2 as ArbitraryObject, options, state, convertingToDiff)
    }
    else if (type1 === 'Map') {
        return compareMapDeepDiff(v1 as Map<unknown, unknown>, v2 as Map<unknown, unknown>, options, state, convertingToDiff)
    }
    else if (type1 === 'Set') {
        return compareSetDeepDiff(v1 as Set<unknown>, v2 as Set<unknown>, options, state, convertingToDiff)
    }
    else if (type1 === 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
        return compareFunctionDeepDiff(v1 as Function, v2 as Function, options, state, convertingToDiff)
    }
    else if (type1 === 'RegExp') {
        return compareRegExpDeepDiff(v1 as RegExp, v2 as RegExp, options, state, convertingToDiff)
    }
    else if (type1 === 'Date') {
        return compareDateDeepDiff(v1 as Date, v2 as Date, options, state, convertingToDiff)
    }
    else if (type1 === 'Error') {
        return compareErrorDeepDiff(v1 as Error, v2 as Error, options, state, convertingToDiff)
    }
    // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer
    else {
        return DifferenceAtomic.new({
            value1      : v1,
            value2      : v2,

            // TODO should use serializer
            content1    : JSON.stringify(v1),
            content2    : JSON.stringify(v2),

            typeOf1     : diffTypeOf(v1),
            typeOf2     : diffTypeOf(v2),

            same        : compareAtomic(v1, v2)
        })
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareArrayDeepDiff = function (
    array1 : unknown[], array2 : unknown[],
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
)
    : Difference
{
    const minLength     = Math.min(array1.length, array2.length)
    const maxLength     = Math.max(array1.length, array2.length)

    const difference    = DifferenceArray.new({ value1 : array1, value2 : array2 })

    state.markVisited(array1, array2, difference, convertingToDiff)

    for (let i = 0; i < minLength; i++) {
        const diff      = compareDeepDiff(array1[ i ], array2[ i ], options, state, convertingToDiff)

        difference.addComparison(i, diff)
    }

    if (maxLength > minLength) {
        const sourceOfExtra     = array1.length === maxLength ? array1 : array2
        const valueProp         = array1.length === maxLength ? 'value1' : 'value2'

        for (let i = minLength; i < maxLength; i++) {
            difference.addComparison(i, valueAsDifference(sourceOfExtra[ i ], valueProp, options, state))
        }
    }

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareKeys = function <K, V>(
    setMap1                 : Set<K> | Map<K, V>,
    setMap2                 : Set<K> | Map<K, V>,
    compareStructurally     : boolean,
    options                 : DeepCompareOptions,
    state                   : DeepCompareState,
    convertingToDiff        : 'value1' | 'value2' | undefined
)
    : { common : { el1 : K, el2 : K, difference : Difference }[], onlyIn1 : Set<K>, onlyIn2 : Set<K> }
{
    const common            = [] as { el1 : K, el2 : K, difference : Difference }[]
    const onlyIn1           = new Set<K>()
    const onlyIn2           = new Set<K>(setMap2.keys())

    for (const [ item1, _ ] of setMap1.entries()) {
        // shortcut for primitive types - strings, numbers etc and for case when both sets have the same objects
        // (sets may contain structurally equal objects)
        if (setMap2.has(item1)) {
            common.push({
                el1             : item1,
                el2             : item1,
                difference      : compareStructurally ? compareDeepDiff(item1, item1, options, state, convertingToDiff) : null
            })
            onlyIn2.delete(item1)
        }
        // full scan with structural comparison
        // we don't need this branch for objects comparison, thus the flag
        else if (compareStructurally && !isAtomicValue(item1) && Array.from(onlyIn2).some(item2 => {
            const innerState    = state.in()

            const difference    = compareDeepDiff(item1, item2, options, innerState, convertingToDiff)
            const equal         = difference.same

            if (equal) {
                state.out(innerState)

                common.push({ el1 : item1, el2 : item2, difference })

                onlyIn2.delete(item2)
            }

            return equal
        })) {
        } else {
            onlyIn1.add(item1)
        }
    }

    return { common, onlyIn1, onlyIn2 }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareSetDeepDiff = function (
    set1 : Set<unknown>, set2 : Set<unknown>,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
)
    : Difference
{
    const difference        = DifferenceSet.new({ value1 : set1, value2 : set2 })

    state.markVisited(set1, set2, difference, convertingToDiff)

    const { common, onlyIn1, onlyIn2 } = compareKeys(set1, set2, true, options, state, convertingToDiff)

    difference.onlyIn2Size  = onlyIn2.size

    common.forEach(commonEntry => difference.addComparison(commonEntry.difference))

    onlyIn1.forEach(el1 => difference.addComparison(valueAsDifference(el1, 'value1', options, state)))
    onlyIn2.forEach(el2 => difference.addComparison(valueAsDifference(el2, 'value2', options, state)))

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareMapDeepDiff = function (
    map1 : Map<unknown, unknown>, map2 : Map<unknown, unknown>,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
)
    : Difference
{
    const difference        = DifferenceMap.new({ value1 : map1, value2 : map2 })

    state.markVisited(map1, map2, difference, convertingToDiff)

    const { common, onlyIn1, onlyIn2 } = compareKeys(map1, map2, true, options, state, convertingToDiff)

    difference.onlyIn2Size  = onlyIn2.size

    common.forEach(commonEntry => difference.addComparison(
        commonEntry.difference,
        compareDeepDiff(map1.get(commonEntry.el1), map2.get(commonEntry.el2), options, state, convertingToDiff)
    ))

    onlyIn1.forEach(el1 =>
        difference.addComparison(
            valueAsDifference(el1, 'value1', options, state),
            valueAsDifference(map1.get(el1), 'value1', options, state)
        )
    )
    onlyIn2.forEach(el2 =>
        difference.addComparison(
            valueAsDifference(el2, 'value2', options, state),
            valueAsDifference(map2.get(el2), 'value2', options, state)
        )
    )

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareObjectDeepDiff = function (
    object1 : ArbitraryObject, object2 : ArbitraryObject,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
)
    : Difference
{
    const difference = DifferenceObject.new({ value1 : object1, value2 : object2 })

    state.markVisited(object1, object2, difference, convertingToDiff)

    const { common, onlyIn1, onlyIn2 }  = compareKeys(
        new Set(Object.keys(object1)), new Set(Object.keys(object2)), false, options, state, convertingToDiff
    )

    difference.onlyIn2Size              = onlyIn2.size

    for (let i = 0; i < common.length; i++) {
        const key1      = common[ i ].el1
        const key2      = common[ i ].el2

        const diff      = compareDeepDiff(object1[ key1 ], object2[ key2 ], options, state, convertingToDiff)

        difference.addComparison(key1, diff)
    }

    onlyIn1.forEach(key1 => difference.addComparison(key1, valueAsDifference(object1[ key1 ], 'value1', options, state)))
    onlyIn2.forEach(key2 => difference.addComparison(key2, valueAsDifference(object2[ key2 ], 'value2', options, state)))

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareErrorDeepDiff = function (
    object1 : Error, object2 : Error,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
)
    : Difference
{
    const difference = DifferenceObject.new({ value1 : object1, value2 : object2 })

    state.markVisited(object1, object2, difference, convertingToDiff)

    const { common, onlyIn1, onlyIn2 }  = compareKeys(
        new Set(Object.keys(object1)), new Set(Object.keys(object2)), false, options, state, convertingToDiff
    )

    common.push({ el1 : 'message', el2 : 'message', difference : null })

    difference.onlyIn2Size              = onlyIn2.size

    for (let i = 0; i < common.length; i++) {
        const key1      = common[ i ].el1
        const key2      = common[ i ].el2

        const diff      = compareDeepDiff(object1[ key1 ], object2[ key2 ], options, state, convertingToDiff)

        difference.addComparison(key1, diff)
    }

    onlyIn1.forEach(key1 => difference.addComparison(key1, valueAsDifference(object1[ key1 ], 'value1', options, state)))
    onlyIn2.forEach(key2 => difference.addComparison(key2, valueAsDifference(object2[ key2 ], 'value2', options, state)))

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareFunctionDeepDiff = function (
    func1 : Function, func2 : Function,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
) : Difference {
    const difference = DifferenceReferenceable.new({ value1 : func1, value2 : func2, same : func1 === func2 })

    state.markVisited(func1, func2, difference, convertingToDiff)

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareRegExpDeepDiff = function (
    regexp1 : RegExp, regexp2 : RegExp,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
) : Difference {
    const regexpProps   = [ 'source', 'dotAll', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode' ]

    const difference    = DifferenceReferenceable.new({
        value1  : regexp1,
        value2  : regexp2,
        same    : regexpProps.every(propertyName => regexp1[ propertyName ] === regexp2[ propertyName])
    })

    state.markVisited(regexp1, regexp2, difference, convertingToDiff)

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareDateDeepDiff = function (
    date1 : Date, date2 : Date,
    options : DeepCompareOptions, state : DeepCompareState, convertingToDiff : 'value1' | 'value2' | undefined
) : Difference {
    const difference = DifferenceReferenceable.new({ value1 : date1, value2 : date2, same : date1.getTime() === date2.getTime() })

    if (!options.compareDateByValue) state.markVisited(date1, date2, difference, convertingToDiff)

    return difference
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareFuzzyMatchersDeepDiff = function (
    v1                  : unknown,
    v2                  : unknown,
    options             : DeepCompareOptions,
    state               : DeepCompareState,
    // this argument is used when some value is compared with itself, to convert it into a Difference instance
    // (which can be used for rendering later)
    convertingToDiff    : 'value1' | 'value2' | undefined
)
    : Difference | undefined
{
    // const v1IsMatcher   = v1 instanceof FuzzyMatcher
    // const v2IsMatcher   = v2 instanceof FuzzyMatcher
    //
    // if (v1IsMatcher && !v2IsMatcher) {
    //     return (v1 as FuzzyMatcher).equalsToDiff(v2, false, options, state, convertingToDiff)
    // }
    // else if (v2IsMatcher && !v1IsMatcher) {
    //     return (v2 as FuzzyMatcher).equalsToDiff(v1, true, options, state, convertingToDiff)
    // }

    return undefined
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareAtomic = (v1 : unknown, v2 : unknown, strictEquality : boolean = true) : boolean =>
    (strictEquality ? v1 === v2 : v1 == v2) || (Number.isNaN(v1) && Number.isNaN(v2))


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const comparePrimitiveAndFuzzyMatchers = function (
    v1                  : unknown,
    v2                  : unknown,
    options             : DeepCompareOptions    = defaultDeepCompareOptions,
    strictEquality      : boolean               = true
)
    : boolean
{
    const state         = DeepCompareState.new()

    const matchersDiff  = compareFuzzyMatchersDeepDiff(v1, v2, options, state, undefined)

    if (matchersDiff) return matchersDiff.same

    return compareAtomic(v1, v2, strictEquality)
}
