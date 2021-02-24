import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ColoredStringPlain } from "../jsx/ColoredString.js"
import { SiestaJSX } from "../jsx/Factory.js"
import {
    RenderingFrame,
    RenderingFrameContent,
    RenderingFrameIndent,
    RenderingFrameOutdent,
    RenderingFrameSequence,
    RenderingFrameStartBlock
} from "../jsx/RenderingFrame.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRendererSerialization } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { ArbitraryObjectKey, constructorNameOf, isAtomicValue, typeOf } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Visitor } from "../visitor/Visitor.js"

//---------------------------------------------------------------------------------------------------------------------
export const serializationVisitSymbol = Symbol('serializationVisitSymbol')


//---------------------------------------------------------------------------------------------------------------------
export class SerializerXml extends Mixin(
    [ Visitor, Base ],
    (base : ClassUnion<typeof Visitor, typeof Base>) =>

    class SerializerXml extends base {
        maxWide             : number        = Number.MAX_SAFE_INTEGER

        outOfWideSymbol     : XmlElement    = <out_of_wide></out_of_wide>

        currentElement      : XmlElement    = <Serialization></Serialization>

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
                this.write(<out_of_depth constructorName={ constructorNameOf(value) || typeOf(value) }></out_of_depth>)
            }
        }


        visitAtomicValue (value : unknown, depth : number) {
            this.write(<atomic_value>{ value }</atomic_value>)
        }


        visitAlreadyVisited (value : unknown, depth : number) {
            const valueReference        = this.references.get(value)

            if (valueReference !== undefined) {
                this.write(<reference refId={ valueReference }></reference>)
            } else {
                const alreadyVisitedAs  = this.valueToEl.get(value)

                const refCount          = this.refCounter++

                this.references.set(value, refCount)

                alreadyVisitedAs.setAttribute('refId', refCount)

                this.write(<reference refId={ refCount }></reference>)
            }
        }


        visitUndefined (value : symbol, depth : number) {
            this.write(<undefined></undefined>)
        }


        visitNull (value : symbol, depth : number) {
            this.write(<null></null>)
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
            this.write(<string>{ '"' + value.replace(/"/g, '\\"').replace(/\n/g, '↵') + '"' }</string>)
        }


        visitDate (value : Date, depth : number) {
            this.write(<date>{ dateToString(value) }</date>)
        }


        visitRegExp (value : RegExp, depth : number) {
            this.write(<regexp>{ String(value) }</regexp>)
        }


        visitFunction (value : Function, depth : number) {
            this.write(<function>{ functionSources(value) }</function>)
        }


        visitObject (object : object, depth : number) : any {
            const objectEl          = <object size={ 0 }></object>

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
            if (index === 0) this.currentElement.setAttribute('size', entries.length)

            if (index < this.maxWide) {
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
            if (index < this.maxWide) {
                this.push(<object_entry_value></object_entry_value>)

                super.visitObjectEntryValue(key, value, object, index, entries, depth)

                this.pop()
                this.pop()
            }
            else if (index === this.maxWide)
                this.write(this.outOfWideSymbol)
        }


        visitArray (array : unknown[], depth : number) : any {
            this.push(<SerializationArray length={ array.length }></SerializationArray>)

            super.visitArray(array, depth)

            this.pop()
        }

        visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
            if (index < this.maxWide) {
                super.visitArrayEntry(value, array, index, depth)
            }
            else if (index === this.maxWide)
                this.write(this.outOfWideSymbol)
        }


        visitSet (set : Set<unknown>, depth : number) : any {
            this.push(<set size={ set.size }></set>)

            super.visitSet(set, depth)

            this.pop()
        }

        visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
            if (index < this.maxWide) {
                super.visitSetElement(value, set, index, depth)
            }
            else if (index === this.maxWide)
                this.write(this.outOfWideSymbol)
        }


        visitMap (map : Map<unknown, unknown>, depth : number) : any {
            this.push(<map size={ map.size }></map>)

            super.visitMap(map, depth)

            this.pop()
        }

        visitMapEntryKey<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            if (index < this.maxWide) {
                this.push(<map_entry></map_entry>)

                this.push(<map_entry_key></map_entry_key>)

                super.visitMapEntryKey(key, value, map, index, depth)

                this.pop()
            }
        }

        visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            if (index < this.maxWide) {
                this.push(<map_entry_value></map_entry_value>)

                super.visitMapEntryValue(key, value, map, index, depth)

                this.pop()
                this.pop()
            }
            else if (index === this.maxWide)
                this.write(this.outOfWideSymbol)
        }


        static serialize <T extends typeof SerializerXml> (this : T, value : unknown, props? : Partial<InstanceType<T>>) : XmlElement {
            const serializer = this.new(props)

            serializer.visit(value)

            return serializer.currentElement
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



//---------------------------------------------------------------------------------------------------------------------
export type SerializationChildNode = SerializationNumber | SerializationArray


@serializable()
export class Serialization extends XmlElement {
    tagName         : 'serialization'           = 'serialization'

    childNodes      : SerializationChildNode[]
}


//---------------------------------------------------------------------------------------------------------------------
export class SerializationReferencable extends XmlElement {
    refId           : number        = undefined
}



//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationArray extends SerializationReferencable {
    props           : {
        length          : number
    }

    length          : number            = undefined

    tagName         : 'array'           = 'array'

    childNodes      : SerializationChildNode[]


    render (renderer : XmlRendererSerialization) : RenderingFrame {
        const sequence      = RenderingFrameSequence.new()

        sequence.write('[')

        sequence.push(RenderingFrameIndent.new(), this.renderChildren(renderer), RenderingFrameOutdent.new())

        sequence.write(']')

        return sequence
    }


    renderChildren (renderer : XmlRendererSerialization) : RenderingFrame {
        const sequence      = RenderingFrameSequence.new()

        this.childNodes.forEach((child, index) => {
            if (index === 0)
                if (renderer.prettyPrint) sequence.push(RenderingFrameStartBlock.new())

            sequence.push(isString(child)
                ?
                    RenderingFrameContent.new({ content : ColoredStringPlain.fromString(child) })
                :
                    child.render(renderer)
            )

            if (index !== this.childNodes.length - 1)
                sequence.write(renderer.prettyPrint ? ',\n' : ',')
            else
                sequence.write(renderer.prettyPrint ? '\n' : '')
        })

        return sequence
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationNumber extends XmlElement {
    tagName         : 'number'          = 'number'

    childNodes      : [ string ]
}

