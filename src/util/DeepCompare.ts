import { Base } from "../class/Base.js"
import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { ArbitraryObject, ArbitraryObjectKey, typeOf } from "./Helpers.js"
import { span, xml, XmlNode } from "./XmlElement.js"


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
    type            : 'object' | 'array' | 'map'    = 'object'

    key             : unknown                       = undefined

    asXmlNode () : XmlNode[] {
        let str : string    = undefined

        switch (this.type) {
            case "object" :
                str = String(this.key)
                break

            case "array" :
                str = `[ ${ this.key } ]`
                break

            case "map" :
                str = `.get(${ this.key })`
        }

        return [ str ]
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class Difference extends Base {
    keyPath     : PathSegment[] = []

    asXmlNode () : XmlNode[] {
        throw new Error("Abstract method")
    }


    keyPathXmlNode () : XmlNode {
        if (this.keyPath.length === 0) {
            return span("difference_key_path", 'root')
        } else {
            return span("difference_key_path", ...this.keyPath.flatMap(pathSegment => pathSegment.asXmlNode()))
        }
    }
}


export class DifferenceTypesAreDifferent extends Difference {
    v1          : unknown       = undefined
    v2          : unknown       = undefined

    type1       : string        = ''
    type2       : string        = ''


    asXmlNode () : XmlNode[] {
        return [
            'The values at ', this.keyPathXmlNode(), ' have different types:',
            xml({ tag : 'ul', class : 'difference_got_expected', childNodes : [
                xml({ tag : 'li', class : 'difference_got', childNodes : [
                    span('difference_title', 'Got      : '),
                    span('difference_value', this.type1),
                    ' ',
                    span('difference_value', this.type1)
                ] }),
                xml({ tag : 'li', class : 'difference_expected', childNodes : [
                    span('difference_title', 'Expected : '),
                    span('difference_value', this.type2)
                ] })
            ] })
        ]
    }
}


export class DifferenceMissingSetElement extends Difference {
    set1            : Set<unknown>  = undefined
    set2            : Set<unknown>  = undefined

    missingElement  : unknown       = undefined

    missingIn       : '1' | '2'     = '1'
}


export class DifferenceMissingMapKey extends Difference {
    map1            : Map<unknown, unknown>     = undefined
    map2            : Map<unknown, unknown>     = undefined

    missingKey      : unknown       = undefined

    missingIn       : '1' | '2'     = '1'
}


export class DifferenceMissingObjectKey extends Difference {
    object1         : ArbitraryObject   = undefined
    object2         : ArbitraryObject   = undefined

    missingKey      : ArbitraryObjectKey = undefined

    missingIn       : '1' | '2'     = '1'
}


export class DifferenceMissingArrayEntry extends Difference {
    array1          : unknown[]     = undefined
    array2          : unknown[]     = undefined

    missingIndex    : number        = undefined

    missingIn       : '1' | '2'     = '1'
}


export class DifferenceFunctionSources extends Difference {
    func1           : Function      = undefined
    func2           : Function      = undefined
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
}


export class DifferenceValuesAreDifferent extends Difference {
    v1          : unknown       = undefined
    v2          : unknown       = undefined
}

//---------------------------------------------------------------------------------------------------------------------
export type DeepCompareOptions = {
    includePropertiesFromPrototypeChain : boolean
}


//---------------------------------------------------------------------------------------------------------------------
// using generator will potentially allow to easily implement "show more differences" button somewhere in the UI
export const compareDeepGen = function * (
    v1 : unknown,
    v2 : unknown,
    options : DeepCompareOptions = { includePropertiesFromPrototypeChain : false },
    keyPath : PathSegment[] = []
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

    const type1         = typeOf(v1)
    const type2         = typeOf(v2)

    if (type1 !== type2) {
        yield DifferenceTypesAreDifferent.new({ v1, v2, type1, type2, keyPath })
    }
    else if (type1 === 'Array') {
        yield* compareArrayDeepGen(v1 as unknown[], v2 as unknown[], options, keyPath)
    }
    else if (type1 === 'Object') {
        yield* compareObjectDeepGen(v1 as ArbitraryObject, v2 as ArbitraryObject, options, keyPath)
    }
    else if (type1 === 'Map') {
        yield* compareMapDeepGen(v1 as Map<unknown, unknown>, v2 as Map<unknown, unknown>, options, keyPath)
    }
    else if (type1 === 'Set') {
        yield* compareSetDeepGen(v1 as Set<unknown>, v2 as Set<unknown>, options, keyPath)
    }
    else if (type1 == 'Function' || type1 === 'AsyncFunction' || type1 === 'GeneratorFunction' || type1 === 'AsyncGeneratorFunction') {
        yield* compareFunctionDeepGen(v1 as Function, v2 as Function, options, keyPath)
    }
    else if (type1 == 'RegExp') {
        yield* compareRegExpDeepGen(v1 as RegExp, v2 as RegExp, options, keyPath)
    }
    else if (type1 == 'Date') {
        yield* compareDateDeepGen(v1 as Date, v2 as Date, options, keyPath)
    }
    // TODO support TypedArrays, ArrayBuffer, SharedArrayBuffer, Promise, Generator, AsyncGenerator
    else {
        yield* comparePrimitivesGen(v1, v2, options, keyPath)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareArrayDeepGen = function * (array1 : unknown[], array2 : unknown[], options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {

    const minLength     = Math.min(array1.length, array2.length)

    for (let i = 0; i < minLength; i++) {
        yield* compareDeepGen(array1[ i ], array2[ i ], options, keyPath.concat(PathSegment.new({ type : 'array', key : i })))
    }

    const maxLength     = Math.max(array1.length, array2.length)

    for (let i = minLength; i < maxLength; i++) {
        yield DifferenceMissingArrayEntry.new({ array1, array2, missingIndex : i, missingIn : array2.length === maxLength ? '1' : '2', keyPath })
    }
}



//---------------------------------------------------------------------------------------------------------------------
export const compareSetDeepGen = function * (set1 : Set<unknown>, set2 : Set<unknown>, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    for (const item1 of set1) {
        if (!set2.has(item1)) {
            yield DifferenceMissingSetElement.new({ set1, set2, missingElement : item1, missingIn : '2', keyPath })
        }
    }

    for (const item2 of set2) {
        if (!set1.has(item2)) {
            yield DifferenceMissingSetElement.new({ set1, set2, missingElement : item2, missingIn : '1', keyPath })
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareObjectDeepGen = function * (object1 : ArbitraryObject, object2 : ArbitraryObject, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    const seen      = new Set<ArbitraryObjectKey>()

    for (const [ key1, value1 ] of Object.entries(object1)) {
        if (!object2.hasOwnProperty(key1))
            yield DifferenceMissingObjectKey.new({ object1, object2, missingKey : key1, missingIn : '2', keyPath })
        else {
            seen.add(key1)

            yield* compareDeepGen(value1, object2[ key1 ], options, keyPath.concat(PathSegment.new({ type : 'object', key : key1 })))
        }
    }

    for (const [ key2, value2 ] of Object.entries(object2)) {
        if (!object1.hasOwnProperty(key2))
            yield DifferenceMissingObjectKey.new({ object1, object2, missingKey : key2, missingIn : '1', keyPath })
        else {
            if (!seen.has(key2))
                yield* compareDeepGen(value2, object1[ key2 ], options, keyPath.concat(PathSegment.new({ type : 'object', key : key2 })))
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareMapDeepGen = function * (map1 : Map<unknown, unknown>, map2 : Map<unknown, unknown>, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    const seen      = new Set<unknown>()

    for (const [ key1, value1 ] of map1) {
        if (!map2.has(key1))
            yield DifferenceMissingMapKey.new({ map1, map2, missingKey : key1, missingIn : '2', keyPath })
        else {
            seen.add(key1)

            yield* compareDeepGen(value1, map2.get(key1), options, keyPath.concat(PathSegment.new({ type : 'map', key : key1 })))
        }
    }

    for (const [ key2, value2 ] of map2) {
        if (!map1.has(key2))
            yield DifferenceMissingMapKey.new({ map1, map2, missingKey : key2, missingIn : '1', keyPath })
        else {
            if (!seen.has(key2))
                yield* compareDeepGen(value2, map1.get(key2), options, keyPath.concat(PathSegment.new({ type : 'map', key : key2 })))
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareFunctionDeepGen = function * (func1 : Function, func2 : Function, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    if (func1.toString() !== func2.toString())
        yield DifferenceFunctionSources.new({ func1, func2, keyPath })
}


//---------------------------------------------------------------------------------------------------------------------
export const compareRegExpDeepGen = function * (regexp1 : RegExp, regexp2 : RegExp, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    const regexpProps   = [ 'source', 'dotAll', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode' ]

    if (regexpProps.some(propertyName => regexp1[ propertyName ] !== regexp2[ propertyName])) {
        yield DifferenceRegExp.new({
            regexp1, regexp2,
            ...Object.fromEntries(regexpProps.map(propertyName => [ propertyName, regexp1[ propertyName ] === regexp2[ propertyName] ])),
            keyPath
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const compareDateDeepGen = function * (date1 : Date, date2 : Date, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    if (date1.getTime() !== date2.getTime())
        yield DifferenceDate.new({ date1, date2, keyPath })
}


//---------------------------------------------------------------------------------------------------------------------
export const comparePrimitivesGen = function * (v1 : unknown, v2 : unknown, options : DeepCompareOptions, keyPath : PathSegment[] = []) : Generator<Difference> {
    if (v1 !== v2) yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath })

    // if (v1 instanceof PlaceHolder && v2 instanceof PlaceHolder)
    //     return v1.equalsTo(v2)
    // else if (v1 instanceof PlaceHolder)
    //     return v1.equalsTo(v2)
    // else if (v2 instanceof PlaceHolder)
    //     return v2.equalsTo(v1)
}
