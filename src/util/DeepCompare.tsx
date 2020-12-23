import { Base } from "../class/Base.js"
import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { CI } from "../collection/Iterator.js"
import { SiestaJSX } from "../siesta/jsx/Factory.js"
import { XmlElement, XmlNode, XmlStream } from "../siesta/jsx/XmlElement.js"
import { ArbitraryObject, ArbitraryObjectKey, typeOf } from "./Helpers.js"
import { Serializer } from "./Serializer.js"


//---------------------------------------------------------------------------------------------------------------------
export class PlaceHolder extends Mixin(
    [],
    (base : AnyConstructor) =>

    class PlaceHolder extends base {

        * equalsToGen (v : unknown) : Generator<Difference> {
            throw new Error("Abstract method")
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class PathSegment extends Base {
    type            : 'object_key' | 'map_key' | 'array_index' | 'set_element'    = 'object_key'

    key             : unknown                       = undefined

    asXmlNode () : XmlNode[] {
        let str : string    = undefined

        switch (this.type) {
            case "object_key" :
                str = `.${ this.key }`
                break

            case "array_index" :
                str = `[ ${ this.key } ]`
                break

            case "map_key" :
                str = `.get(${ Serializer.serialize(this.key, 4, 4) })`
        }

        return [ str ]
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class Difference extends Base {
    keyPath     : PathSegment[] = []

    asXmlNode () : XmlElement {
        throw new Error("Abstract method")
    }


    keyPathXmlNode () : XmlElement {
        if (this.keyPath.length === 0) {
            return <span class="difference_key_path">root</span>
        } else {
            return <span class="difference_key_path">{ ...this.keyPath.flatMap(pathSegment => pathSegment.asXmlNode()) }</span>
        }
    }
}


export class DifferenceTypesAreDifferent extends Difference {
    v1          : unknown       = undefined
    v2          : unknown       = undefined

    type1       : string        = ''
    type2       : string        = ''


    asXmlNode () : XmlElement {
        return <div>
            The values at { this.keyPathXmlNode() } have different types:
            <unl class='difference_got_expected'>
                <li class='difference_got'>
                    <span class="difference_title">Got value of <span class="typename">`{ this.type1 }`</span>     : </span>
                    <span class="difference_value">{ Serializer.serialize(this.v1, 4, 4) }</span>
                </li>
                <li class='difference_expected'>
                    <span class="difference_title">Expected value of <span class="typename">`{ this.type2 }`</span>: </span>
                    <span class="difference_value">{ Serializer.serialize(this.v2, 4, 4) }</span>
                </li>
            </unl>
        </div>
    }
}


export class DifferenceReachability extends Difference {
    v1          : unknown       = undefined
    v2          : unknown       = undefined

    v1Path      : PathSegment[] = undefined
    v2Path      : PathSegment[] = undefined


    asXmlNode () : XmlElement {
        return <div>
            The values at { this.keyPathXmlNode() } have different reachability:
        </div>
    }
}



export class DifferenceSet<V = unknown> extends Difference {
    set1            : Set<V>    = undefined
    set2            : Set<V>    = undefined

    common1         : V[]       = undefined
    common2         : V[]       = undefined

    onlyIn1         : Set<V>    = undefined
    onlyIn2         : Set<V>    = undefined


    asXmlNode () : XmlElement {
        return <div>
            The <span class="typename">`Set`</span>s at { this.keyPathXmlNode() } are different:
            <ul>
                {
                    this.onlyIn1.size > 0 && <li>
                        Elements present only in the set we got (missing in the expected set)
                        <ul>{
                            Array.from(this.onlyIn1).map(el => <li>{ Serializer.serialize(el, 4, 4) }</li>)
                        }</ul>
                    </li>
                }
                {
                    this.onlyIn2.size > 0 && <li>
                        Elements present only in the set we expect (missing in the set we got)
                        <ul>{
                            Array.from(this.onlyIn2).map(el => <li>{ Serializer.serialize(el, 4, 4) }</li>)
                        }</ul>
                    </li>
                }
            </ul>
        </div>
    }
}


export class DifferenceMap<K = unknown, V = unknown> extends Difference {
    map1            : Map<K, V>     = undefined
    map2            : Map<K, V>     = undefined

    common1         : K[]           = undefined
    common2         : K[]           = undefined

    onlyIn1         : Set<K>        = undefined
    onlyIn2         : Set<K>        = undefined


    asXmlNode () : XmlElement {
        return <div>
            The <span class="typename">`Map`</span>s at { this.keyPathXmlNode() } are different:
            <ul>
                {
                    this.onlyIn1.size > 0 && <li>
                        Keys present only in the map we got (missing in the expected map)
                        <ul>
                            { CI(this.onlyIn1).take(5).map(el => <li>{ Serializer.serialize(el, 4, 4) } : { Serializer.serialize(this.map1.get(el), 4, 4) }</li>) }
                            { this.onlyIn1.size > 5 && <li>... 5 from { this.onlyIn1.size } are shown</li> }
                        </ul>
                    </li>
                }
                {
                    this.onlyIn2.size > 0 && <li>
                        Keys present only in the map we expect (missing in the map we got)
                        <ul>
                            { CI(this.onlyIn2).take(5).map(el => <li>{ Serializer.serialize(el, 4, 4) } : { Serializer.serialize(this.map2.get(el), 4, 4) }</li>) }
                            { this.onlyIn2.size > 5 && <li>... 5 from { this.onlyIn2.size } are shown</li> }
                        </ul>
                    </li>
                }
            </ul>
        </div>
    }
}


export class DifferenceObject extends Difference {
    object1         : ArbitraryObject           = undefined
    object2         : ArbitraryObject           = undefined

    common1         : ArbitraryObjectKey[]      = undefined
    common2         : ArbitraryObjectKey[]      = undefined

    onlyIn1         : Set<ArbitraryObjectKey>   = undefined
    onlyIn2         : Set<ArbitraryObjectKey>   = undefined


    asXmlNode () : XmlElement {
        return <div>
            The <span class="typename">`Object`</span>s at { this.keyPathXmlNode() } are different:
            <ul>
                {
                    this.onlyIn1.size > 0 && <li>
                        Keys present only in the object we got (missing in the expected object)
                        <ul>
                            { CI(this.onlyIn1).take(5).map(el => <li>{ Serializer.serialize(el, 4, 4) } : { Serializer.serialize(this.object1[ el as any ], 4, 4) }</li>) }
                            { this.onlyIn1.size > 5 && <li>... 5 from { this.onlyIn1.size } are shown</li> }
                        </ul>
                    </li>
                }
                {
                    this.onlyIn2.size > 0 && <li>
                        Elements present only in the set we expect (missing in the set we got)
                        <ul>
                            { CI(this.onlyIn2).take(5).map(el => <li>{ Serializer.serialize(el, 4, 4) } : { Serializer.serialize(this.object2[ el as any ], 4, 4) }</li>) }
                            { this.onlyIn2.size > 5 && <li>... 5 from { this.onlyIn2.size } are shown</li> }
                        </ul>
                    </li>
                }
            </ul>
        </div>
    }
}


export class DifferenceArrayLengthIsDifferent extends Difference {
    array1          : unknown[]     = undefined
    array2          : unknown[]     = undefined

    startingFrom    : number        = undefined

    type            : 'extra' | 'missing'   = undefined


    asXmlNode () : XmlElement {
        const minLength     = Math.min(this.array1.length, this.array2.length)

        return <div>
            <p>The arrays at { this.keyPathXmlNode() } have different length.</p>
            <p>We have an array of length <span class="ligther_smooth_accent_color">{ this.array1.length }</span>
                &nbsp;and expect an array of length <span class="ligther_smooth_accent_color">{ this.array2.length }</span>
            </p>
            {
                minLength > 0
                    ?
                <p>Indicies [ 0...{ minLength - 1 } ] present in both arrays</p>
                    :
                ''
            }
            <p>{
                this.type === 'extra'
                    ?
                `Extra elements, missing in the expected array`
                    :
                `Missing elements, present in the expected array`
            }:</p>
            <unl>{
                (this.type === 'extra' ? this.array1 : this.array2).slice(this.startingFrom).map((el, index) =>
                    <li><span>[ { index + this.startingFrom } ]</span> : { Serializer.serialize(el, 4, 4) }</li>
                )
            }</unl>
        </div>
    }
}


export class DifferenceFunction extends Difference {
    func1           : Function      = undefined
    func2           : Function      = undefined

    asXmlNode () : XmlElement {
        return <div>
            <p>The <span class="typename">`Functions`</span>s at { this.keyPathXmlNode() } are different:</p>
            <unl className='difference_got_expected'>
                <li class='difference_got'>
                    <span class="difference_title">Got      : </span>
                    <span class="difference_value">{ Serializer.serialize(this.func1, 4, 4) }</span>
                </li>
                <li class='difference_expected'>
                    <span class="difference_title">Expected : </span>
                    <span class="difference_value">{ Serializer.serialize(this.func2, 4, 4) }</span>
                </li>
            </unl>
        </div>
    }
}


export class DifferenceRegExp extends Difference {
    regexp1         : RegExp        = undefined
    regexp2         : RegExp        = undefined

    source          : boolean       = undefined
    dotAll          : boolean       = undefined
    global          : boolean       = undefined
    ignoreCase      : boolean       = undefined
    multiline       : boolean       = undefined
    sticky          : boolean       = undefined
    unicode         : boolean       = undefined
}


export class DifferenceDate extends Difference {
    date1           : Date          = undefined
    date2           : Date          = undefined


    asXmlNode () : XmlElement {
        return <div>
            <p>The <span class="typename">`Date`</span>s at { this.keyPathXmlNode() } are different:</p>
            <unl className='difference_got_expected'>
                <li class='difference_got'>
                    <span class="difference_title">Got      : </span>
                    <span class="difference_value">{ Serializer.serialize(this.date1, 4, 4) }</span>
                </li>
                <li class='difference_expected'>
                    <span class="difference_title">Expected : </span>
                    <span class="difference_value">{ Serializer.serialize(this.date2, 4, 4) }</span>
                </li>
            </unl>
        </div>
    }
}


export class DifferenceValuesAreDifferent extends Difference {
    v1          : unknown       = undefined
    v2          : unknown       = undefined

    asXmlNode () : XmlElement {
        return <div>
            The values at { this.keyPathXmlNode() } are different:
            <unl class='difference_got_expected'>
                <li class='difference_got'>
                    <span class="difference_title">Got      : </span>
                    <span class="difference_value">{ Serializer.serialize(this.v1, 4, 4) }</span>
                </li>
                <li class='difference_expected'>
                    <span class="difference_title">Expected : </span>
                    <span class="difference_value">{ Serializer.serialize(this.v2, 4, 4) }</span>
                </li>
            </unl>
        </div>
    }
}

//---------------------------------------------------------------------------------------------------------------------
export type DeepCompareOptions = {
    includePropertiesFromPrototypeChain : boolean
}


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
// using generator will potentially allow to easily implement "show more differences" button somewhere in the UI
export const compareDeepGen = function * (
    v1          : unknown,
    v2          : unknown,
    options     : DeepCompareOptions    = { includePropertiesFromPrototypeChain : false },
    state       : DeepCompareState      = DeepCompareState.new()
)
    : Generator<Difference>
{
    // // some (or both) of the inputs is a PlaceHolder instance
    // if (v1 instanceof PlaceHolder && v2 instanceof PlaceHolder)
    //     yield v1.equalsTo(v2)
    // else if (v1 instanceof PlaceHolder)
    //     return v1.equalsTo(v2)
    // else if (v2 instanceof PlaceHolder)
    //     return v2.equalsTo(v1)
    //
    // //

    const v1Visit   = state.visited1.get(v1)
    const v2Visit   = state.visited2.get(v2)

    if (v1Visit && !v2Visit || !v1Visit && v2Visit || v1Visit && v1Visit[ 0 ] !== v2Visit[ 0 ]) {
        yield DifferenceReachability.new({
            v1, v2, keyPath : state.keyPathSnapshot(),
            v1Path      : v1Visit !== undefined ? v1Visit[ 1 ] : undefined,
            v2Path      : v2Visit !== undefined ? v2Visit[ 1 ] : undefined,
        })

        return
    }
    else if (v1Visit && v1Visit[ 0 ] === v2Visit[ 0 ]) {
        return
    }

    const type1         = typeOf(v1)
    const type2         = typeOf(v2)

    if (type1 !== type2) {
        yield DifferenceTypesAreDifferent.new({ v1, v2, type1, type2, keyPath : state.keyPathSnapshot() })
    }
    else if (type1 === 'Array') {
        state.markVisited(v1, v2)

        yield* compareArrayDeepGen(v1 as unknown[], v2 as unknown[], options, state)
    }
    else if (type1 === 'Object') {
        state.markVisited(v1, v2)

        yield* compareObjectDeepGen(v1 as ArbitraryObject, v2 as ArbitraryObject, options, state)
    }
    else if (type1 === 'Map') {
        state.markVisited(v1, v2)

        yield* compareMapDeepGen(v1 as Map<unknown, unknown>, v2 as Map<unknown, unknown>, options, state)
    }
    else if (type1 === 'Set') {
        state.markVisited(v1, v2)

        yield* compareSetDeepGen(v1 as Set<unknown>, v2 as Set<unknown>, options, state)
    }
    else if (type1 == 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
        state.markVisited(v1, v2)

        yield* compareFunctionDeepGen(v1 as Function, v2 as Function, options, state)
    }
    else if (type1 == 'RegExp') {
        state.markVisited(v1, v2)

        yield* compareRegExpDeepGen(v1 as RegExp, v2 as RegExp, options, state)
    }
    else if (type1 == 'Date') {
        state.markVisited(v1, v2)

        yield* compareDateDeepGen(v1 as Date, v2 as Date, options, state)
    }
    // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer
    else {
        yield* comparePrimitivesGen(v1, v2, options, state)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareArrayDeepGen = function * (
    array1 : unknown[], array2 : unknown[], options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Generator<Difference>
{
    const minLength     = Math.min(array1.length, array2.length)

    for (let i = 0; i < minLength; i++) {
        state.keyPath.push(PathSegment.new({ type : 'array_index', key : i }))

        yield* compareDeepGen(array1[ i ], array2[ i ], options, state)

        state.keyPath.pop()
    }

    const maxLength     = Math.max(array1.length, array2.length)

    if (maxLength > minLength)
        yield DifferenceArrayLengthIsDifferent.new({
            keyPath         : state.keyPathSnapshot(),
            array1,
            array2,
            type            : array1.length === maxLength ? 'extra' : 'missing',
            startingFrom    : minLength
        })
}


//---------------------------------------------------------------------------------------------------------------------
export const compareKeys = function <K, V>(
    setMap1 : Set<K> | Map<K, V>, setMap2 : Set<K> | Map<K, V>,
    options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : { common1 : K[], common2 : K[], onlyIn1 : Set<unknown>, onlyIn2 : Set<unknown> }
{
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
        else if (Array.from(onlyIn2).some(item2 => {
            const innerState = state.in()

            innerState.push(PathSegment.new({ type : 'set_element', key : item2 }))

            const equal = CI(compareDeepGen(item1, item2, options, innerState)).take(1).length === 0

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
export const compareSetDeepGen = function * (
    set1 : Set<unknown>, set2 : Set<unknown>, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Generator<Difference>
{
    const { common1, common2, onlyIn1, onlyIn2 } = compareKeys(set1, set2, options, state)

    if (onlyIn1.size > 0 || onlyIn2.size > 0) {
        yield DifferenceSet.new({
            set1, set2, common1, common2, onlyIn1, onlyIn2
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareObjectDeepGen = function * (
    object1 : ArbitraryObject, object2 : ArbitraryObject, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Generator<Difference>
{
    const { common1, common2, onlyIn1, onlyIn2 } = compareKeys(new Set(Object.keys(object1)), new Set(Object.keys(object2)), options, state)

    for (let i = 0; i < common1.length; i++) {
        const key1      = common1[ i ]
        const key2      = common2[ i ]

        state.push(PathSegment.new({ type : 'object_key', key : key1 }))

        yield* compareDeepGen(object1[ key1 ], object2[ key2 ], options, state)

        state.pop()
    }

    if (onlyIn1.size > 0 || onlyIn2.size > 0) {
        yield DifferenceObject.new({
            object1, object2, common1, common2, onlyIn1 : onlyIn1 as Set<ArbitraryObjectKey>, onlyIn2 : onlyIn2 as Set<ArbitraryObjectKey>
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareMapDeepGen = function * (
    map1 : Map<unknown, unknown>, map2 : Map<unknown, unknown>, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
)
    : Generator<Difference>
{
    const { common1, common2, onlyIn1, onlyIn2 } = compareKeys(map1, map2, options, state)

    for (let i = 0; i < common1.length; i++) {
        const key1      = common1[ i ]
        const key2      = common2[ i ]

        state.push(PathSegment.new({ type : 'map_key', key : key1 }))

        yield* compareDeepGen(map1.get(key1), map2.get(key2), options, state)

        state.pop()
    }

    if (onlyIn1.size > 0 || onlyIn2.size > 0) {
        yield DifferenceMap.new({
            map1, map2, common1, common2, onlyIn1, onlyIn2
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareFunctionDeepGen = function * (
    func1 : Function, func2 : Function, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()
) : Generator<Difference> {
    if (func1 !== func2)
        yield DifferenceFunction.new({ func1, func2, keyPath : state.keyPathSnapshot() })
}


//---------------------------------------------------------------------------------------------------------------------
export const compareRegExpDeepGen = function * (regexp1 : RegExp, regexp2 : RegExp, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
    const regexpProps   = [ 'source', 'dotAll', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode' ]

    if (regexpProps.some(propertyName => regexp1[ propertyName ] !== regexp2[ propertyName])) {
        yield DifferenceRegExp.new({
            regexp1, regexp2,
            ...Object.fromEntries(regexpProps.map(propertyName => [ propertyName, regexp1[ propertyName ] === regexp2[ propertyName] ])),
            keyPath : state.keyPathSnapshot()
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareDateDeepGen = function * (date1 : Date, date2 : Date, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
    if (date1.getTime() !== date2.getTime())
        yield DifferenceDate.new({ date1, date2, keyPath : state.keyPathSnapshot() })
}


//---------------------------------------------------------------------------------------------------------------------
export const comparePrimitivesGen = function * (v1 : unknown, v2 : unknown, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
    if (v1 !== v2) yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath : state.keyPathSnapshot() })

    // if (v1 instanceof PlaceHolder && v2 instanceof PlaceHolder)
    //     return v1.equalsTo(v2)
    // else if (v1 instanceof PlaceHolder)
    //     return v1.equalsTo(v2)
    // else if (v2 instanceof PlaceHolder)
    //     return v2.equalsTo(v1)
}

/*

  └─✘ Compare sets
    ├─✔ [isDeeply] at line 123
    ├─✘ [isDeeply(got, expected)] at line 123
    │ Provided values are different. Here is the difference found:
    │ · The sets at root are different:
    │   There are 117 common elements
    │   Got                     │         Expected
    │   3                       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │   4                       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │   3                       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │   4                       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │   3                       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │   (115 more)              │
    │   ░░░░░░░░░░░░░░░░░░░░░░░ │ 8
    │   ░░░░░░░░░░░░░░░░░░░░░░░ │ 11
    │   ░░░░░░░░░░░░░░░░░░░░░░░ │ 23
    │   ░░░░░░░░░░░░░░░░░░░░░░░ │ 4
    │   ░░░░░░░░░░░░░░░░░░░░░░░ │ 13
    │                             (115 more)
    └─✘ [isDeeply] at line 123
      Provided values are different. Here are the differences found:
      · The sets at root are different:
        Elements missing in the expected set, present in the set we have:
        · 4
      · The sets at root are different:
        Elements missing in the set we have, present in the expected set:
        · 0


 */