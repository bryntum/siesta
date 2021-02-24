import { Base } from "../class/Base.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { SerializerXml } from "../serializer/SerializerXml.js"
import { TreeNode } from "../tree/TreeNode.js"
import { typeOf } from "../util/Helpers.js"
import { DifferenceValuesAreDifferent, PathSegment } from "./CompareDeep.js"
import { FuzzyMatcher } from "./FuzzyMatcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class Difference extends /*TreeNode.mix(*/Base/*)*/ {
    parent          : Difference

    // parentNode      : Difference
    // childNodeT      : Difference

    template (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        throw new Error("Abstract method")
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceMissing extends Difference {
    value           : unknown           = undefined

    from            : '1' | '2'         = undefined

    template (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <difference_missing>
            {/*<lhs>{ SerializerXml.serialize(this.lhs, serializerConfig) }</lhs>*/}
            {/*<rhs>{ SerializerXml.serialize(this.rhs, serializerConfig) }</rhs>*/}
        </difference_missing>
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class DifferenceSame extends Difference {
    value           : unknown       = undefined

    template (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <difference_same>
            <same>{ SerializerXml.serialize(this.value, serializerConfig) }</same>
        </difference_same>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceDifferent extends Difference {
    v1          : unknown
    v2          : unknown

    template (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <difference_different>
            <lhs>{ SerializerXml.serialize(this.v1, serializerConfig) }</lhs>
            <rhs>{ SerializerXml.serialize(this.v2, serializerConfig) }</rhs>
        </difference_different>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceArray extends Difference {
    length1         : number        = 0
    length2         : number        = 0

    comparisons     : { index : number, difference : Difference }[]      = []

    template (serializerConfig? : Partial<SerializerXml>) : XmlElement {
        return <difference_array>
            <difference_array_entry index={ 0 } type="same"></difference_array_entry>
            <difference_array_entry index={ 1 } type="different"><difference></difference></difference_array_entry>
            <difference_array_entry index={ 2 } type="lhs_only"><serialization></serialization></difference_array_entry>
            <difference_array_entry index={ 3 } type="rhs_only"><serialization></serialization></difference_array_entry>
            {/*<rhs>{ SerializerXml.serialize(this.rhs, serializerConfig) }</rhs>*/}
        </difference_array>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DeepCompareState extends Base {
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
export const compareDeepGen = function (
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
        return DifferenceDifferent.new({ v1, v2 })
    }
    else if (type1 === 'Array') {
        // state.markVisited(v1, v2)

        return compareArrayDeepGen(v1 as unknown[], v2 as unknown[], options, state)
    }
    // else if (type1 === 'Object') {
    //     state.markVisited(v1, v2)
    //
    //     yield* compareObjectDeepGen(v1 as ArbitraryObject, v2 as ArbitraryObject, options, state)
    // }
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
export const compareArrayDeepGen = function (
    array1 : unknown[], array2 : unknown[], options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Difference
{
    const minLength     = Math.min(array1.length, array2.length)
    const maxLength     = Math.max(array1.length, array2.length)

    const comparisons : { index : number, difference : Difference }[]  = []

    let diffNum : number    = 0

    for (let i = 0; i < minLength; i++) {
        state.keyPath.push(PathSegment.new({ type : 'array_index', key : i }))

        const difference        = compareDeepGen(array1[ i ], array2[ i ], options, state)

        if (!(difference instanceof DifferenceSame)) diffNum++

        comparisons.push({ index : i, difference })

        state.keyPath.pop()
    }


    if (maxLength > minLength) {
        const sourceOfExtra     = array1.length === maxLength ? array1 : array2
        const from              = array1.length === maxLength ? '1' : '2'

        for (let i = minLength; i < maxLength; i++) {
            state.keyPath.push(PathSegment.new({ type : 'array_index', key : i }))

            comparisons.push({ index : i, difference : DifferenceMissing.new({ value : sourceOfExtra[ i ], from }) })

            diffNum++

            state.keyPath.pop()
        }
    }

    return diffNum > 0
        ?
            DifferenceArray.new({
                comparisons,
                length1     : array1.length,
                length2     : array2.length
            })
        :
            DifferenceSame.new({ value : array2 })
}


//---------------------------------------------------------------------------------------------------------------------
export const comparePrimitivesGen = (
    v1 : unknown, v2 : unknown, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
) : Difference => {
    if (v1 === v2 || (Number.isNaN(v1) && Number.isNaN(v2))) return DifferenceSame.new({ value : v2 })

    return DifferenceDifferent.new({ v1, v2 })

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
