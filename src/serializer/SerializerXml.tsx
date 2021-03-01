import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { ArbitraryObjectKey, constructorNameOf, isAtomicValue, typeOf } from "../util/Helpers.js"
import { Visitor } from "../visitor/Visitor.js"
import {
    Serialization,
    SerializationArray,
    SerializationMap,
    SerializationObject, SerializationOutOfDepth, SerializationReference,
    SerializationReferenceable,
    SerializationSet
} from "./SerializerRendering.js"

//---------------------------------------------------------------------------------------------------------------------
export const serializationVisitSymbol = Symbol('serializationVisitSymbol')


//---------------------------------------------------------------------------------------------------------------------
export class SerializerXml extends Mixin(
    [ Visitor, Base ],
    (base : ClassUnion<typeof Visitor, typeof Base>) =>

    class SerializerXml extends base {
        maxBreadth          : number        = Number.MAX_SAFE_INTEGER

        includeFunctionSources : boolean    = true

        outOfWideSymbol     : XmlElement    = <out_of_wide></out_of_wide>

        result              : Serialization = <Serialization></Serialization> as Serialization

        currentElement      : XmlElement    = this.result

        refCounter          : number        = 1

        references          : Map<unknown, number>  = new Map()

        valueToEl           : Map<unknown, XmlElement>  = new Map()

        beforeVisitEl       : unknown       = undefined

        internalVisitSymbol     : symbol            = serializationVisitSymbol


        beforeVisit (value : unknown, depth : number) {
            this.beforeVisitEl  = value

            this.visited.set(value, value)

            return value
        }


        write (el : XmlElement) {
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


        visitUndefined (value : symbol, depth : number) {
            this.write(<undefined>undefined</undefined>)
        }


        visitNull (value : symbol, depth : number) {
            this.write(<null>null</null>)
        }


        visitSymbol (value : symbol, depth : number) {
            this.write(<symbol>{ value }</symbol>)
        }


        visitBoolean (value : boolean, depth : number) {
            // note, that just `<boolean>{ value }</boolean>` will create empty tag (`false` is ignored)
            this.write(<boolean>{ String(value) }</boolean>)
        }


        visitNumber (value : number, depth : number) {
            this.write(<number>{ value }</number>)
        }


        visitString (value : string, depth : number) {
            // we use `'"' +` expressions inside the {} to create a single child node
            // the form `<string>"{}"</string>` would create 3 child nodes
            this.write(<string>{ '"' + value /*.replace(/"/g, '\\"').replace(/\n/g, '↵')*/ + '"' }</string>)
        }


        visitDate (value : Date, depth : number) {
            this.write(<date>{ dateToString(value) }</date>)
        }


        visitRegExp (value : RegExp, depth : number) {
            this.write(<regexp>{ String(value) }</regexp>)
        }


        visitFunction (value : Function, depth : number) {
            if (this.includeFunctionSources)
                this.write(<function>{ functionSources(value) }</function>)
            else
                this.write(<function>[Function]</function>)
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
                this.push(<object_entry></object_entry>)

                this.push(<object_entry_key></object_entry_key>)

                super.visitObjectEntryKey(key, value, object, index, entries, depth)

                this.pop()
            }
        }

        visitObjectEntryValue (
            key : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            if (index < this.maxBreadth) {
                this.push(<object_entry_value></object_entry_value>)

                super.visitObjectEntryValue(key, value, object, index, entries, depth)

                this.pop()
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
                this.push(<map_entry></map_entry>)

                this.push(<map_entry_key></map_entry_key>)

                super.visitMapEntryKey(key, value, map, index, depth)

                this.pop()
            }
        }

        visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            if (index < this.maxBreadth) {
                this.push(<map_entry_value></map_entry_value>)

                super.visitMapEntryValue(key, value, map, index, depth)

                this.pop()
                this.pop()
            }
            else if (index === this.maxBreadth)
                this.write(this.outOfWideSymbol)
        }


        static serialize <T extends typeof SerializerXml> (this : T, value : unknown, props? : Partial<InstanceType<T>>) : Serialization {
            const serializer = this.new(props)

            serializer.visit(value)

            return serializer.result
        }
    }
){}


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
