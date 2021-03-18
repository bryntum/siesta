import { Base } from "../class/Base.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { SerializerXml } from "../serializer/SerializerXml.js"
import { ArbitraryObject, ArbitraryObjectKey, constructorNameOf, MIN_SMI, typeOf } from "../util/Helpers.js"
import {
    DifferenceTemplateArray,
    DifferenceTemplateArrayEntry,
    DifferenceTemplateMap,
    DifferenceTemplateMapEntry,
    DifferenceTemplateObject,
    DifferenceTemplateObjectEntry,
    DifferenceTemplateReference,
    DifferenceTemplateRoot,
    DifferenceTemplateSet,
    DifferenceTemplateValue,
    MissingValue
} from "./CompareDeepDiffRendering.js"


//---------------------------------------------------------------------------------------------------------------------
export class PathSegment extends Base {
    type            : 'object_key' | 'map_key' | 'array_index' | 'set_element'    = 'object_key'

    key             : unknown                       = undefined

    asXmlNode (serializerConfig : Partial<SerializerXml> = {}) : XmlNode[] {
        let str : string    = undefined

        switch (this.type) {
            case "object_key" :
                str = `.${ this.key }`
                break

            case "array_index" :
                str = `[ ${ this.key } ]`
                break

            case "map_key" :
                str = `.get(${ SerializerXml.serialize(this.key, serializerConfig) })`
                break

            case "set_element" :
                str = `.element(${ SerializerXml.serialize(this.key, serializerConfig) })`
                break
        }

        return [ str ]
    }
}


const Missing   = Symbol('Missing')
type Missing    = typeof Missing

//---------------------------------------------------------------------------------------------------------------------
export type DifferenceType = 'both' | 'onlyIn1' | 'onlyIn2'

export class Difference extends Base {
    value1          : unknown | Missing         = Missing
    value2          : unknown | Missing         = Missing

    reachability1   : number                    = undefined
    reachability2   : number                    = undefined

    refId1          : number                    = undefined
    refId2          : number                    = undefined

    same            : boolean                   = false


    get type () : DifferenceType {
        const has1  = this.value1 !== Missing
        const has2  = this.value2 !== Missing

        return has1 && has2 ? 'both' : has1 ? 'onlyIn1' : 'onlyIn2'
    }


    templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        return <DifferenceTemplateValue type={ this.type }>
            { this.value1 === Missing ? <MissingValue></MissingValue> : diffState[ 0 ].serialize(this.value1) }
            { this.value2 === Missing ? <MissingValue></MissingValue> : diffState[ 1 ].serialize(this.value2) }
        </DifferenceTemplateValue>
    }


    template (
        serializerConfig? : Partial<SerializerXml>,
        diffState : [ SerializerXml, SerializerXml ] = [ SerializerXml.new(serializerConfig), SerializerXml.new(serializerConfig) ]
    ) : DifferenceTemplateRoot {
        return <DifferenceTemplateRoot>
            { this.templateInner(serializerConfig, diffState) }
        </DifferenceTemplateRoot> as DifferenceTemplateRoot
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceArray extends Difference {
    value1          : unknown[]
    value2          : unknown[]

    same            : boolean           = true

    comparisons     : { index : number, difference : Difference }[]      = []


    addComparison (index : number, difference : Difference) {
        this.comparisons.push({ index, difference })

        if (this.same && !difference.same) this.same = false
    }


    templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        return <DifferenceTemplateArray
            type={ this.type } length={ this.value1.length } length2={ this.value2.length }
            refId={ this.refId1 } refId2={ this.refId2 }
        >{
            this.comparisons.map(({ index, difference }) =>
                <DifferenceTemplateArrayEntry type={ difference.type } index={ index }>
                    { difference.templateInner(serializerConfig, diffState) }
                </DifferenceTemplateArrayEntry>
            )
        }</DifferenceTemplateArray>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type DifferenceObjectType    = 'common' | 'onlyIn1' | 'onlyIn2'

export class DifferenceObject extends Difference {
    same            : boolean                   = true

    comparisons     : { key : ArbitraryObjectKey, difference : Difference }[]  = []

    // common          : { el1 : ArbitraryObjectKey, el2 : ArbitraryObjectKey, difference : Difference }[] = undefined
    //
    // onlyIn1         : Set<ArbitraryObjectKey>   = undefined
    // onlyIn2         : Set<ArbitraryObjectKey>   = undefined


    addComparison (key : ArbitraryObjectKey, difference : Difference) {
        this.comparisons.push({ key, difference })

        if (this.same && !difference.same) this.same = false
    }


    templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        return <DifferenceTemplateObject
            type={ this.type }
            constructorName={ this.value1 !== Missing ? constructorNameOf(this.value1) : undefined }
            constructorName2={ this.value2 !== Missing ? constructorNameOf(this.value2) : undefined }
            refId={ this.refId1 }
            refId2={ this.refId2 }
        >{
            this.comparisons.map(({ key, difference }) =>
                <DifferenceTemplateObjectEntry type={ difference.type }>
                    {
                        difference.type === 'both'
                            ?
                                <DifferenceTemplateValue type={ difference.type }>
                                    { diffState[ 0 ].serialize(key) }
                                    { diffState[ 1 ].serialize(key) }
                                </DifferenceTemplateValue>
                            :
                                difference.type === 'onlyIn1'
                                    ?
                                        <DifferenceTemplateValue type={ difference.type }>
                                            { diffState[ 0 ].serialize(key) }
                                            <MissingValue></MissingValue>
                                        </DifferenceTemplateValue>
                                    :
                                        <DifferenceTemplateValue type={ difference.type }>
                                            <MissingValue></MissingValue>
                                            { diffState[ 1 ].serialize(key) }
                                        </DifferenceTemplateValue>
                    }
                    { difference.templateInner(serializerConfig, diffState) }
                </DifferenceTemplateObjectEntry>
            )
        }</DifferenceTemplateObject>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type DifferenceSetType    = 'common' | 'onlyIn1' | 'onlyIn2'

export class DifferenceSet extends Difference {
    value1          : Set<unknown>
    value2          : Set<unknown>

    same            : boolean                   = true

    comparisons     : { type : DifferenceSetType, difference : Difference }[]     = []

    // common          : unknown[]      = undefined
    //
    // onlyIn1         : Set<unknown>   = undefined
    // onlyIn2         : Set<unknown>   = undefined


    addComparison (type : DifferenceSetType, difference : Difference) {
        this.comparisons.push({ type, difference })

        if (this.same && !difference.same) this.same = false
    }


    templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        return <DifferenceTemplateSet
            type={ this.type } size={ this.value1.size } size2={ this.value2.size }
            refId={ this.refId1 } refId2={ this.refId2 }
        >{
            this.comparisons.map(({ difference }) => difference.templateInner(serializerConfig, diffState))
        }</DifferenceTemplateSet>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type DifferenceMapType    = 'common' | 'onlyIn1' | 'onlyIn2'

export class DifferenceMap extends Difference {
    value1          : Map<unknown, unknown>
    value2          : Map<unknown, unknown>

    same            : boolean                   = true

    comparisons     : { type : DifferenceMapType, differenceKeys : Difference, differenceValues : Difference }[]     = []

    // common          : unknown[]      = undefined
    //
    // onlyIn1         : Set<unknown>   = undefined
    // onlyIn2         : Set<unknown>   = undefined


    addComparison (type : DifferenceMapType, differenceKeys : Difference, differenceValues : Difference) {
        this.comparisons.push({ type, differenceKeys, differenceValues })

        if (this.same && (!differenceKeys.same || !differenceValues.same)) this.same = false
    }


    templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        return <DifferenceTemplateMap
            type={ this.type } size={ this.value1.size } size2={ this.value2.size }
            refId={ this.refId1 } refId2={ this.refId2 }
        >{
            this.comparisons.map(({ differenceKeys, differenceValues }) =>
                <DifferenceTemplateMapEntry type={ differenceKeys.type }>
                    { differenceKeys.templateInner(serializerConfig, diffState) }
                    { differenceValues.templateInner(serializerConfig, diffState) }
                </DifferenceTemplateMapEntry>
            )
        }</DifferenceTemplateMap>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceReference extends Difference {
    value1      : number
    value2      : number


    templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        return <DifferenceTemplateReference type={ this.type } refId1={ this.value1 } refId2={ this.value2 }>
        </DifferenceTemplateReference>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DeepCompareState extends Base {
    // currentDiff     : Difference                = undefined

    idSource        : number                    = MIN_SMI + 1

    refIdSource1    : number                    = 1
    refIdSource2    : number                    = 1

    keyPath         : PathSegment[]             = []

    visited1        : Map<unknown, [ number, Difference ]>  = new Map()
    visited2        : Map<unknown, [ number, Difference ]>  = new Map()


    keyPathSnapshot () : PathSegment[] {
        return this.keyPath.slice()
    }


    markVisited (v1 : unknown, v2 : unknown, difference : Difference) {
        const visitId : number    = this.idSource++

        !this.visited1.has(v1) && this.visited1.set(v1, [ visitId, difference ])
        !this.visited2.has(v2) && this.visited2.set(v2, [ visitId, difference ])
    }


    push (segment : PathSegment) {
        this.keyPath.push(segment)
    }


    pop () {
        this.keyPath.pop()
    }


    in () : DeepCompareState {
        return DeepCompareState.new({
            idSource        : this.idSource,
            keyPath         : [],
            visited1        : new Map(this.visited1),
            visited2        : new Map(this.visited2)
        })
    }


    out (state : DeepCompareState) {
        this.idSource       = state.idSource

        this.visited1       = state.visited1
        this.visited2       = state.visited2
    }
}


//---------------------------------------------------------------------------------------------------------------------
// none of these options are implemented yet
export type DeepCompareOptions = {
    omitEqual                   : boolean,
    // if `true` instances of difference classes will be considered different,
    // even if they contain the same properties
    requireSameClass            : boolean
    maxDifferences              : number,
    cycleIsPartOfDataStructure  : boolean
}

const defaultDeepCompareOptions : DeepCompareOptions = {
    omitEqual                   : false,
    requireSameClass            : false,
    maxDifferences              : Number.MAX_SAFE_INTEGER,
    cycleIsPartOfDataStructure  : true
}


//---------------------------------------------------------------------------------------------------------------------
export const compareDeepDiff = function (
    v1          : unknown,
    v2          : unknown,
    options     : DeepCompareOptions    = defaultDeepCompareOptions,
    state       : DeepCompareState      = DeepCompareState.new()
)
    : Difference
{
    // // shortcut exit to save time, this also allows to compare the placeholder with itself
    // if (v1 === v2) return
    //
    // // some (or both) of the inputs is a PlaceHolder instance
    // if (v1 instanceof FuzzyMatcher && v2 instanceof FuzzyMatcher) {
    //     yield* v1.equalsToGen(v2, false, options, state)
    //     return
    // }
    // else if (v1 instanceof FuzzyMatcher) {
    //     yield* v1.equalsToGen(v2, false, options, state)
    //     return
    // }
    // else if (v2 instanceof FuzzyMatcher) {
    //     yield* v2.equalsToGen(v1, true, options, state)
    //     return
    // }

    const v1Visit   = state.visited1.get(v1)
    const v2Visit   = state.visited2.get(v2)

    const has1      = v1Visit !== undefined

    if (has1) {
        let refId1  = v1Visit[ 1 ].refId1

        if (refId1 === undefined) refId1 = v1Visit[ 1 ].refId1 = state.refIdSource1++
    }

    const has2      = v2Visit !== undefined

    if (has2) {
        let refId2  = v2Visit[ 1 ].refId2

        if (refId2 === undefined) refId2 = v2Visit[ 1 ].refId2 = state.refIdSource2++
    }

    const hasBoth   = v1Visit !== undefined && v2Visit !== undefined

    if (hasBoth && v1Visit[ 0 ] === v2Visit[ 0 ]) {
        // cyclic visit from the same location in both data structures
        // this is considered as an equal value - the real difference
        // will be determined by the 1st visit
        return DifferenceReference.new({ value1 : v1Visit[ 1 ].refId1, value2 : v2Visit[ 1 ].refId2, same : true })
    }
    else if (options.cycleIsPartOfDataStructure && hasBoth && v1Visit[ 0 ] !== v2Visit[ 0 ]) {
        return Difference.new({ value1 : v1, value2 : v2, reachability1 : v1Visit[ 0 ], reachability2 : v2Visit[ 0 ] })
    }

    const type1         = typeOf(v1)
    const type2         = typeOf(v2)

    if (type1 !== type2) {
        return Difference.new({ value1 : v1, value2 : v2 })
    }
    else if (type1 === 'Array') {
        return compareArrayDeepDiff(v1 as unknown[], v2 as unknown[], options, state)
    }
    else if (type1 === 'Object') {
        return compareObjectDeepDiff(v1 as ArbitraryObject, v2 as ArbitraryObject, options, state)
    }
    else if (type1 === 'Map') {
        return compareMapDeepDiff(v1 as Map<unknown, unknown>, v2 as Map<unknown, unknown>, options, state)
    }
    else if (type1 === 'Set') {
        return compareSetDeepDiff(v1 as Set<unknown>, v2 as Set<unknown>, options, state)
    }
    else if (type1 == 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
        return compareFunctionDeepDiff(v1 as Function, v2 as Function, options, state)
    }
    else if (type1 == 'RegExp') {
        return compareRegExpDeepDiff(v1 as RegExp, v2 as RegExp, options, state)
    }
    else if (type1 == 'Date') {
        return compareDateDeepDiff(v1 as Date, v2 as Date, options, state)
    }
    // // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer
    else {
        return comparePrimitiveDeepDiff(v1, v2, options, state)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareArrayDeepDiff = function (
    array1 : unknown[], array2 : unknown[], options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Difference
{
    const minLength     = Math.min(array1.length, array2.length)
    const maxLength     = Math.max(array1.length, array2.length)

    const difference    = DifferenceArray.new({ value1 : array1, value2 : array2 })

    state.markVisited(array1, array2, difference)

    for (let i = 0; i < minLength; i++) {
        state.keyPath.push(PathSegment.new({ type : 'array_index', key : i }))

        const diff      = compareDeepDiff(array1[ i ], array2[ i ], options, state)

        difference.addComparison(i, diff)

        state.keyPath.pop()
    }

    if (maxLength > minLength) {
        const sourceOfExtra     = array1.length === maxLength ? array1 : array2
        const from              = array1.length === maxLength ? 'value1' : 'value2'

        for (let i = minLength; i < maxLength; i++) {
            state.keyPath.push(PathSegment.new({ type : 'array_index', key : i }))

            difference.addComparison(i, Difference.new({ [ from ] : sourceOfExtra[ i ] }))

            state.keyPath.pop()
        }
    }

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const compareKeys = function <K, V>(
    setMap1                 : Set<K> | Map<K, V>,
    setMap2                 : Set<K> | Map<K, V>,
    compareStructurally     : boolean,
    options                 : DeepCompareOptions,
    state                   : DeepCompareState = DeepCompareState.new()
)
    : { common : { el1 : K, el2 : K, difference : Difference }[], onlyIn1 : Set<K>, onlyIn2 : Set<K> }
{
    const pathSegmentType   = setMap1 instanceof Map ? 'map_key' : 'set_element'

    const common            = [] as { el1 : K, el2 : K, difference : Difference}[]
    const onlyIn1           = new Set<K>()
    const onlyIn2           = new Set<K>(setMap2.keys())

    for (const [ item1, _ ] of setMap1.entries()) {
        // shortcut for primitive types - strings, numbers etc and for case when both sets has the same objects
        // (sets may contain structurally equal objects)
        if (setMap2.has(item1)) {
            common.push({
                el1             : item1,
                el2             : item1,
                difference      : compareStructurally ? Difference.new({ value1 : item1, value2 : item1, same : true }) : null
            })
            onlyIn2.delete(item1)
        }
        // full scan with structural comparison
        // we don't need this branch for objects comparison, thus the flag
        else if (compareStructurally && Array.from(onlyIn2).some(item2 => {
            const innerState    = state.in()

            innerState.push(PathSegment.new({ type : pathSegmentType, key : item2 }))

            const difference    = compareDeepDiff(item1, item2, options, innerState)
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


//---------------------------------------------------------------------------------------------------------------------
export const compareSetDeepDiff = function (
    set1 : Set<unknown>, set2 : Set<unknown>, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Difference
{
    const difference        = DifferenceSet.new({ value1 : set1, value2 : set2 })

    state.markVisited(set1, set2, difference)

    const { common, onlyIn1, onlyIn2 } = compareKeys(set1, set2, true, options, state)

    common.forEach(commonEntry => difference.addComparison('common', commonEntry.difference))

    onlyIn1.forEach(el1 => difference.addComparison('onlyIn1', Difference.new({ value1 : el1 })))
    onlyIn2.forEach(el2 => difference.addComparison('onlyIn2', Difference.new({ value2 : el2 })))

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const compareMapDeepDiff = function (
    map1 : Map<unknown, unknown>, map2 : Map<unknown, unknown>, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Difference
{
    const difference        = DifferenceMap.new({ value1 : map1, value2 : map2 })

    state.markVisited(map1, map2, difference)

    const { common, onlyIn1, onlyIn2 } = compareKeys(map1, map2, true, options, state)

    common.forEach(commonEntry => difference.addComparison(
        'common',
        commonEntry.difference,
        compareDeepDiff(map1.get(commonEntry.el1), map2.get(commonEntry.el2), options, state)
    ))

    onlyIn1.forEach(el1 => difference.addComparison('onlyIn1', Difference.new({ value1 : el1 }), Difference.new({ value1 : map1.get(el1) })))
    onlyIn2.forEach(el2 => difference.addComparison('onlyIn2', Difference.new({ value2 : el2 }), Difference.new({ value2 : map2.get(el2) })))

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const compareObjectDeepDiff = function (
    object1 : ArbitraryObject, object2 : ArbitraryObject, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Difference
{
    const difference = DifferenceObject.new({ value1 : object1, value2 : object2 })

    state.markVisited(object1, object2, difference)

    const { common, onlyIn1, onlyIn2 } = compareKeys(new Set(Object.keys(object1)), new Set(Object.keys(object2)), false, options, state)

    for (let i = 0; i < common.length; i++) {
        const key1      = common[ i ].el1
        const key2      = common[ i ].el2

        state.push(PathSegment.new({ type : 'object_key', key : key1 }))

        const diff      = compareDeepDiff(object1[ key1 ], object2[ key2 ], options, state)

        difference.addComparison(key1, diff)

        state.pop()
    }

    onlyIn1.forEach(key1 => difference.addComparison(key1, Difference.new({ value1 : object1[ key1 ] })))
    onlyIn2.forEach(key2 => difference.addComparison(key2, Difference.new({ value2 : object2[ key2 ] })))

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const compareFunctionDeepDiff = function (
    func1 : Function, func2 : Function, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
) : Difference {
    const difference = Difference.new({ value1 : func1, value2 : func2, same : func1 === func2 })

    state.markVisited(func1, func2, difference)

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const compareRegExpDeepDiff = function (
    regexp1 : RegExp, regexp2 : RegExp, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
) : Difference {
    const regexpProps   = [ 'source', 'dotAll', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode' ]

    const difference    = Difference.new({
        value1  : regexp1,
        value2  : regexp2,
        same    : regexpProps.every(propertyName => regexp1[ propertyName ] === regexp2[ propertyName])
    })

    state.markVisited(regexp1, regexp2, difference)

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const compareDateDeepDiff = function (
    date1 : Date, date2 : Date, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
) : Difference {
    const difference = Difference.new({ value1 : date1, value2 : date2, same : date1.getTime() === date2.getTime() })

    state.markVisited(date1, date2, difference)

    return difference
}


//---------------------------------------------------------------------------------------------------------------------
export const comparePrimitiveDeepDiff = (
    value1 : unknown, value2 : unknown, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
) : Difference => {
    if (value1 === value2 || (Number.isNaN(value1) && Number.isNaN(value2))) return Difference.new({ value1, value2, same : true })

    return Difference.new({ value1, value2 })

    // // some (or both) of the inputs is a PlaceHolder instance
    // if (v1 instanceof FuzzyMatcher && v2 instanceof FuzzyMatcher) {
    //     yield* v1.equalsToGen(v2, false, options, state)
    // }
    // else if (v1 instanceof FuzzyMatcher) {
    //     yield* v1.equalsToGen(v2, false, options, state)
    // }
    // else if (v2 instanceof FuzzyMatcher) {
    //     yield* v2.equalsToGen(v1, true, options, state)
    // }
    // else {
    //     yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath : state.keyPathSnapshot() })
    // }
}
