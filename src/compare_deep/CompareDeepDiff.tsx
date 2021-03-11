import { Base } from "../class/Base.js"
import { CI } from "../iterator/Iterator.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { SerializerXml } from "../serializer/SerializerXml.js"
import { ArbitraryObject, ArbitraryObjectKey, typeOf } from "../util/Helpers.js"
import {
    DifferenceTemplateArray,
    DifferenceTemplateArrayEntry,
    DifferenceTemplateObject, DifferenceTemplateObjectEntry,
    DifferenceTemplateRoot,
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
export class Difference extends /*TreeNode.mix(*/Base/*)*/ {
    value1          : unknown | Missing         = Missing
    value2          : unknown | Missing         = Missing

    same            : boolean                   = false

    parent          : Difference                = undefined

    // parentNode      : Difference
    // childNodeT      : Difference

    templateInner (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <DifferenceTemplateValue>
            { this.value1 === Missing ? <MissingValue></MissingValue> : SerializerXml.serialize(this.value1, serializerConfig) }
            { this.value2 === Missing ? <MissingValue></MissingValue> : SerializerXml.serialize(this.value2, serializerConfig) }
        </DifferenceTemplateValue>
    }


    template (serializerConfig? : Partial<SerializerXml>) : DifferenceTemplateRoot {
        return <DifferenceTemplateRoot>
            { this.templateInner(serializerConfig) }
        </DifferenceTemplateRoot> as DifferenceTemplateRoot
    }
}


// //---------------------------------------------------------------------------------------------------------------------
// export class DifferenceMissing extends Difference {
//     value           : unknown           = undefined
//
//     presentIn       : '1' | '2'         = undefined
//
//     templateInner (serializerConfig? : Partial<SerializerXml>) : XmlElement {
//         return <DifferenceTemplateMissing presentIn={ this.presentIn }>
//             { SerializerXml.serialize(this.value, serializerConfig) }
//         </DifferenceTemplateMissing>
//     }
// }
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export class DifferenceSame extends Difference {
//     v1          : unknown       = undefined
//     v2          : unknown       = undefined
//
//     templateInner (serializerConfig? : Partial<SerializerXml>) : XmlElement {
//         return <DifferenceTemplateSame>
//             { SerializerXml.serialize(this.v1, serializerConfig) }
//             { SerializerXml.serialize(this.v2, serializerConfig) }
//         </DifferenceTemplateSame>
//     }
// }
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export class DifferenceDifferent extends Difference {
//     v1          : unknown       = undefined
//     v2          : unknown       = undefined
//
//     templateInner (serializerConfig? : Partial<SerializerXml>) : XmlElement {
//         return <DifferenceTemplateDifferent>
//             { SerializerXml.serialize(this.v1, serializerConfig) }
//             { SerializerXml.serialize(this.v2, serializerConfig) }
//         </DifferenceTemplateDifferent>
//     }
// }


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceArray extends Difference {
    same            : boolean           = true

    comparisons     : { index : number, difference : Difference }[]      = []


    addComparison (index : number, difference : Difference) {
        this.comparisons.push({ index, difference })

        if (this.same && !difference.same) this.same = false
    }


    templateInner (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <DifferenceTemplateArray>{
            this.comparisons.map(({ index, difference }) =>
                <DifferenceTemplateArrayEntry index={ index }>{ difference.templateInner(serializerConfig) }</DifferenceTemplateArrayEntry>
            )
        }</DifferenceTemplateArray>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type DifferenceObjectType    = 'common' | 'onlyIn1' | 'onlyIn2'

export class DifferenceObject extends Difference {
    same            : boolean           = true

    comparisons     : Map<ArbitraryObjectKey, { type : DifferenceObjectType, difference : Difference }>   = new Map()

    common          : ArbitraryObjectKey[]      = undefined

    onlyIn1         : Set<ArbitraryObjectKey>   = undefined
    onlyIn2         : Set<ArbitraryObjectKey>   = undefined


    addComparison (key : ArbitraryObjectKey, type : DifferenceObjectType, difference : Difference) {
        this.comparisons.set(key, { type, difference })

        if (this.same && !difference.same) this.same = false
    }


    templateInner (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <DifferenceTemplateObject>{
            CI(this.comparisons).map(([ key, { type, difference } ]) =>
                <DifferenceTemplateObjectEntry>
                    {
                        type === 'common'
                            ?
                                <DifferenceTemplateValue>
                                    { SerializerXml.serialize(key, serializerConfig) }
                                    { SerializerXml.serialize(key, serializerConfig) }
                                </DifferenceTemplateValue>
                            :
                                type === 'onlyIn1'
                                    ?
                                        <DifferenceTemplateValue>
                                            { SerializerXml.serialize(key, serializerConfig) }
                                            <MissingValue></MissingValue>
                                        </DifferenceTemplateValue>
                                    :
                                        <DifferenceTemplateValue>
                                            <MissingValue></MissingValue>
                                            { SerializerXml.serialize(key, serializerConfig) }
                                        </DifferenceTemplateValue>
                    }
                    { difference.templateInner(serializerConfig) }
                </DifferenceTemplateObjectEntry>
            ).toArray()
        }</DifferenceTemplateObject>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DeepCompareState extends Base {
    // currentDiff     : Difference                = undefined

    idSource        : number                    = 0

    keyPath         : PathSegment[]             = []

    visited1        : Map<unknown, [ number, PathSegment[] ]>       = new Map()
    visited2        : Map<unknown, [ number, PathSegment[] ]>       = new Map()


    keyPathSnapshot () : PathSegment[] {
        return this.keyPath.slice()
    }


    markVisited (v1 : unknown, v2 : unknown) {
        const visitInfo : [ number, PathSegment[] ]    = [ this.idSource++, this.keyPathSnapshot() ]

        this.visited1.set(v1, visitInfo)
        this.visited2.set(v2, visitInfo)
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
export type DeepCompareOptions = {
    omitEqual               : boolean,
    // if `true` instances of difference classes will be considered different,
    // even if they contain the same properties
    requireSameClass        : boolean
    maxDifferences          : number
}

const defaultDeepCompareOptions : DeepCompareOptions = {
    omitEqual               : false,
    requireSameClass        : false,
    maxDifferences          : Number.MAX_SAFE_INTEGER
}


//---------------------------------------------------------------------------------------------------------------------
// using generator will potentially allow to easily implement "show more differences" button somewhere in the UI
// UPDATE actually not, since data can mutate since the generator call
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
    //
    // const v1Visit   = state.visited1.get(v1)
    // const v2Visit   = state.visited2.get(v2)
    //
    // if (v1Visit && !v2Visit || !v1Visit && v2Visit || v1Visit && v1Visit[ 0 ] !== v2Visit[ 0 ]) {
    //     yield DifferenceReachability.new({
    //         v1, v2,
    //         keyPath     : state.keyPathSnapshot(),
    //         v1Path      : v1Visit !== undefined ? v1Visit[ 1 ] : undefined,
    //         v2Path      : v2Visit !== undefined ? v2Visit[ 1 ] : undefined,
    //     })
    //
    //     return
    // }
    // else if (v1Visit && v1Visit[ 0 ] === v2Visit[ 0 ]) {
    //     return
    // }

    const type1         = typeOf(v1)
    const type2         = typeOf(v2)

    if (type1 !== type2) {
        return Difference.new({ value1 : v1, value2 : v2 })
    }
    else if (type1 === 'Array') {
        state.markVisited(v1, v2)

        return compareArrayDeepDiff(v1 as unknown[], v2 as unknown[], options, state)
    }
    else if (type1 === 'Object') {
        state.markVisited(v1, v2)

        return compareObjectDeepDiff(v1 as ArbitraryObject, v2 as ArbitraryObject, options, state)
    }
    // else if (type1 === 'Map') {
    //     state.markVisited(v1, v2)
    //
    //     yield* compareMapDeepGen(v1 as Map<unknown, unknown>, v2 as Map<unknown, unknown>, options, state)
    // }
    // else if (type1 === 'Set') {
    //     state.markVisited(v1, v2)
    //
    //     yield* compareSetDeepGen(v1 as Set<unknown>, v2 as Set<unknown>, options, state)
    // }
    // else if (type1 == 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
    //     state.markVisited(v1, v2)
    //
    //     yield* compareFunctionDeepGen(v1 as Function, v2 as Function, options, state)
    // }
    // else if (type1 == 'RegExp') {
    //     state.markVisited(v1, v2)
    //
    //     yield* compareRegExpDeepGen(v1 as RegExp, v2 as RegExp, options, state)
    // }
    // else if (type1 == 'Date') {
    //     state.markVisited(v1, v2)
    //
    //     yield* compareDateDeepGen(v1 as Date, v2 as Date, options, state)
    // }
    // // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer
    else {
        return comparePrimitivesGen(v1, v2, options, state)
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

    for (let i = 0; i < minLength; i++) {
        state.keyPath.push(PathSegment.new({ type : 'array_index', key : i }))

        const diff        = compareDeepDiff(array1[ i ], array2[ i ], options, state)

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
    : { common1 : K[], common2 : K[], onlyIn1 : Set<K>, onlyIn2 : Set<K> }
{
    const pathSegmentType   = setMap1 instanceof Map ? 'map_key' : 'set_element'

    const common1           = [] as K[]
    const common2           = [] as K[]
    const onlyIn1           = new Set<K>()
    const onlyIn2           = new Set<K>(setMap2.keys())

    for (const [ item1, _ ] of setMap1.entries()) {
        // shortcut for primitive types - strings, numbers etc and for case when both sets has the same objects
        // (sets may contain structurally equal objects)
        if (setMap2.has(item1)) {
            common1.push(item1)
            common2.push(item1)
            onlyIn2.delete(item1)
        }
        // full scan with structural comparison
        else if (compareStructurally && Array.from(onlyIn2).some(item2 => {
            const innerState = state.in()

            innerState.push(PathSegment.new({ type : pathSegmentType, key : item2 }))

            const equal = compareDeepDiff(item1, item2, options, innerState).same

            if (equal) {
                state.out(innerState)

                common1.push(item1)
                common2.push(item2)
                onlyIn2.delete(item2)
            }

            return equal
        })) {
        } else {
            onlyIn1.add(item1)
        }
    }

    return { common1, common2, onlyIn1, onlyIn2 }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareObjectDeepDiff = function (
    object1 : ArbitraryObject, object2 : ArbitraryObject, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Difference
{
    const { common1, common2, onlyIn1, onlyIn2 } = compareKeys(new Set(Object.keys(object1)), new Set(Object.keys(object2)), false, options, state)

    const difference = DifferenceObject.new({
        value1      : object1,
        value2      : object2,

        common      : common1,
        onlyIn1,
        onlyIn2
    })

    for (let i = 0; i < common1.length; i++) {
        const key1      = common1[ i ]
        const key2      = common2[ i ]

        state.push(PathSegment.new({ type : 'object_key', key : key1 }))

        const diff    = compareDeepDiff(object1[ key1 ], object2[ key2 ], options, state)

        difference.addComparison(key1, 'common', diff)

        state.pop()
    }

    onlyIn1.forEach(key1 => difference.addComparison(key1, 'onlyIn1', Difference.new({ value1 : object1[ key1 ]})))
    onlyIn2.forEach(key2 => difference.addComparison(key2, 'onlyIn2', Difference.new({ value2 : object2[ key2 ]})))

    return difference
}



//---------------------------------------------------------------------------------------------------------------------
export const comparePrimitivesGen = (
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
