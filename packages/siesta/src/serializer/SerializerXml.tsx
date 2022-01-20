import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { ArbitraryObjectKey, constructorNameOf, isAtomicValue, typeOf } from "../util/Helpers.js"
import { Visitor } from "typescript-serializable-mixin"
import {
    Serialization,
    SerializationArray, SerializationAtomic,
    SerializationMap, SerializationMapEntry,
    SerializationObject, SerializationObjectEntry, SerializationOutOfDepth, SerializationReference,
    SerializationReferenceable, SerializationReferenceableAtomic,
    SerializationSet
} from "./SerializerRendering.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const serializationVisitSymbol = Symbol('serializationVisitSymbol')


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// extract the mixins part to the separate private class, to support
// the typization of the static method `serialize` in the declaration files case
class SerializerXmlPre extends Mixin(
    [ Visitor, Base ],
    (base : ClassUnion<typeof Visitor, typeof Base>) =>

    class SerializerXmlPre extends base {
    }
){}

export class SerializerXml extends SerializerXmlPre {
    maxBreadth          : number        = Number.MAX_SAFE_INTEGER

    includeFunctionSources : boolean    = true

    outOfWideSymbol     : XmlElement    = <out_of_wide></out_of_wide>

    result              : XmlElement    = undefined

    currentElement      : XmlElement    = undefined

    refCounter          : number        = 1

    references          : Map<unknown, number>  = new Map()

    valueToEl           : Map<unknown, XmlElement>  = new Map()

    beforeVisitEl       : unknown       = undefined

    internalVisitSymbol     : symbol            = serializationVisitSymbol


    write (el : XmlElement) {
        if (!this.currentElement) {
            this.currentElement = this.result = el
        } else
            this.currentElement.appendChild(el)

        if (!this.valueToEl.has(this.beforeVisitEl)) this.valueToEl.set(this.beforeVisitEl, el)
    }


    push (el : XmlElement) {
        this.write(el)

        this.currentElement = el
    }


    pop () {
        this.currentElement = this.currentElement.parent
    }


    visitOutOfDepthValue (value : unknown, depth : number) {
        if (isAtomicValue(value)) {
            this.visitAtomicValueEntry(value, depth)
        } else {
            this.write(<SerializationOutOfDepth constructorName={ constructorNameOf(value) || typeOf(value) }></SerializationOutOfDepth>)
        }
    }


    visitAtomicValue (value : unknown, depth : number) {
        this.write(<atomic_value>{ value }</atomic_value>)
    }


    visitAlreadyVisited (value : unknown, depth : number) {
        const valueReference        = this.references.get(value)

        if (valueReference !== undefined) {
            this.write(<SerializationReference refId={ valueReference }></SerializationReference>)
        } else {
            const alreadyVisitedAs  = this.valueToEl.get(value) as SerializationReferenceable

            const refCount          = this.refCounter++

            this.references.set(value, refCount)

            alreadyVisitedAs.setAttribute('refId', refCount)

            this.write(<SerializationReference refId={ refCount }></SerializationReference>)
        }
    }


    visitNotVisited (value : unknown, depth : number) {
        this.beforeVisitEl  = value

        super.visitNotVisited(value, depth)
    }


    visitUndefined (value : symbol, depth : number) {
        this.write(SerializationAtomic.new({
            tagName     : 'undefined',
            childNodes  : [ 'undefined' ]
        }))
    }


    visitNull (value : symbol, depth : number) {
        this.write(SerializationAtomic.new({
            tagName     : 'null',
            childNodes  : [ 'null' ]
        }))
    }


    visitSymbol (value : symbol, depth : number) {
        this.write(SerializationAtomic.new({
            tagName     : 'symbol',
            childNodes  : [ String(value) ]
        }))
    }


    visitBoolean (value : boolean, depth : number) {
        // note, that just `<boolean>{ value }</boolean>` will create empty tag (`false` is ignored)
        this.write(SerializationAtomic.new({
            tagName     : 'boolean',
            childNodes  : [ String(value) ]
        }))
    }


    visitNumber (value : number, depth : number) {
        this.write(SerializationAtomic.new({
            tagName     : 'number',
            childNodes  : [ String(value) ]
        }))
    }


    visitString (value : string, depth : number) {
        // we use `'"' +` expressions inside the {} to create a single child node
        // the form `<string>"{}"</string>` would create 3 child nodes
        this.write(SerializationAtomic.new({
            tagName     : 'string',
            childNodes  : [ '"' + String(value) + '"' ]
        }))
    }


    visitDate (value : Date, depth : number) {
        this.write(SerializationReferenceableAtomic.new({
            tagName     : 'date',
            childNodes  : [ dateToString(value) ]
        }))
    }


    visitRegExp (value : RegExp, depth : number) {
        this.write(SerializationReferenceableAtomic.new({
            tagName     : 'regexp',
            childNodes  : [ String(value) ]
        }))
    }


    visitFunction (value : Function, depth : number) {
        this.write(SerializationReferenceableAtomic.new({
            tagName     : 'function',
            childNodes  : [ this.includeFunctionSources ? functionSources(value) : '[Function]' ]
        }))
    }


    visitAsyncFunction (value : Function, depth : number) {
        this.write(SerializationReferenceableAtomic.new({
            tagName     : 'function',
            childNodes  : [ this.includeFunctionSources ? functionSources(value) : '[AsyncFunction]' ]
        }))
    }


    visitObject (object : object, depth : number) : any {
        const objectEl          = <SerializationObject size={ 0 }></SerializationObject> as any as SerializationObject

        const constructorName   = constructorNameOf(object)

        if (constructorName !== 'Object') objectEl.setAttribute('constructorName', constructorName)

        this.push(objectEl)

        super.visitObject(object, depth)

        this.pop()
    }

    visitObjectEntryKey (
        key : ArbitraryObjectKey, value : unknown, object : object, index : number,
        entries : [ ArbitraryObjectKey, unknown ][], depth : number
    ) {
        // this should be set inside of the `visitObject` of course, but that would imply
        // an extra call to `Object.entries()`
        if (index === 0) (this.currentElement as SerializationObject).setAttribute('size', entries.length)

        if (index < this.maxBreadth) {
            this.push(<SerializationObjectEntry></SerializationObjectEntry>)

            super.visitObjectEntryKey(key, value, object, index, entries, depth)
        }
    }

    visitObjectEntryValue (
        key : ArbitraryObjectKey, value : unknown, object : object, index : number,
        entries : [ ArbitraryObjectKey, unknown ][], depth : number
    ) {
        if (index < this.maxBreadth) {
            super.visitObjectEntryValue(key, value, object, index, entries, depth)

            this.pop()
        }
        else if (index === this.maxBreadth)
            this.write(this.outOfWideSymbol)
    }


    visitArray (array : unknown[], depth : number) : any {
        this.push(<SerializationArray length={ array.length }></SerializationArray>)

        super.visitArray(array, depth)

        this.pop()
    }

    visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
        if (index < this.maxBreadth) {
            super.visitArrayEntry(value, array, index, depth)
        }
        else if (index === this.maxBreadth)
            this.write(this.outOfWideSymbol)
    }


    visitSet (set : Set<unknown>, depth : number) : any {
        this.push(<SerializationSet size={ set.size }></SerializationSet>)

        super.visitSet(set, depth)

        this.pop()
    }

    visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
        if (index < this.maxBreadth) {
            super.visitSetElement(value, set, index, depth)
        }
        else if (index === this.maxBreadth)
            this.write(this.outOfWideSymbol)
    }


    visitMap (map : Map<unknown, unknown>, depth : number) : any {
        this.push(<SerializationMap size={ map.size }></SerializationMap>)

        super.visitMap(map, depth)

        this.pop()
    }

    visitMapEntryKey<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
        if (index < this.maxBreadth) {
            this.push(<SerializationMapEntry></SerializationMapEntry>)

            super.visitMapEntryKey(key, value, map, index, depth)
        }
    }

    visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
        if (index < this.maxBreadth) {
            super.visitMapEntryValue(key, value, map, index, depth)

            this.pop()
        }
        else if (index === this.maxBreadth)
            this.write(this.outOfWideSymbol)
    }


    serialize (value : unknown) : XmlElement {
        this.visit(value)

        const result        = this.result

        this.currentElement = this.result = undefined

        return result
    }


    static serialize <T extends typeof SerializerXml> (this : T, value : unknown, props? : Partial<InstanceType<T>>) : Serialization {
        const serializer    = this.new(props)

        serializer.currentElement   = <Serialization></Serialization> as Serialization

        serializer.visit(value)

        return serializer.currentElement as Serialization
    }
}


const functionSources = (func : Function) : string => {
    const sources                       = func.toString().split('\n')

    let minCommonLeadingWhitespace      = Infinity

    sources.forEach((line, index) => {
        // ignore first line, which won't have the common leading whitespace
        if (index === 0) return

        const leadingWhitespaceMatch  = /^(\s*)/.exec(line)

        if (leadingWhitespaceMatch) {
            const leadingWhitespace   = leadingWhitespaceMatch[ 1 ]

            // ignore whitespace-only lines
            if (leadingWhitespace === line) return

            if (leadingWhitespace.length < minCommonLeadingWhitespace) minCommonLeadingWhitespace  = leadingWhitespace.length
        }
    })

    if (minCommonLeadingWhitespace < Infinity) sources.forEach((line, index) => {
        // ignore first line, which won't have the common leading whitespace
        if (index === 0) return

        sources[ index ]    = line.slice(minCommonLeadingWhitespace)
    })

    return sources.join('\n')
}


const prependZeros = (num : number) : string => {
    return num >= 10 ? String(num) : '0' + String(num)
}


const dateToString = (date : Date) : string => {
    return `new Date("${ date.getFullYear() }/${ prependZeros(date.getMonth()) }/${ prependZeros(date.getDate()) } ${ prependZeros(date.getHours()) }:${ prependZeros(date.getMinutes()) }:${ prependZeros(date.getSeconds()) }.${ date.getMilliseconds() }")`
}
