import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { isString } from "../../util/Typeguards.js"
import { SiestaJSX } from "./Factory.js"

//---------------------------------------------------------------------------------------------------------------------
export type XmlNode = string | XmlElement

export type XmlStream = XmlNode | (XmlNode | XmlStream)[]


@serializable('XmlElement')
export class XmlElement extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class XmlElement extends base {
        childNodes      : XmlNode[]                 = []

        tagName         : string                    = 'tag'

        $attributes     : { [ key : string ] : string } = undefined

        get attributes () : { [ key : string ] : string } {
            if (this.$attributes !== undefined) return this.$attributes

            return this.$attributes = {}
        }

        set attributes (value : { [ key : string ] : string }) {
            this.$attributes = value === null ? undefined : value
        }


        set class (value : string | string[]) {
            this.attributes.class   = isString(value) ? value : value.join(' ')
        }


        toString () : string {
            const childrenContent       = this.childNodes.map(child => child.toString())
            const attributesContent     = this.$attributes
                ?
                    Object.entries(this.attributes).map(( [ name, value ] ) => name + '="' + escapeXml(String(value)) + '"')
                :
                    []

            // to have predictable order of attributes in tests
            attributesContent.sort()

            return `<${ this.tagName }${ attributesContent.length > 0 ? ' ' + attributesContent.join(' ') : '' }>${ childrenContent.join('') }</${ this.tagName }>`
        }


        appendChild (...child : XmlStream[]) : XmlStream[] {
            this.childNodes.push(...child.flat(Number.MAX_SAFE_INTEGER))

            return child
        }


        setAttribute (name, value) {
            this.attributes[ name ] = value
        }
    }
){}

//---------------------------------------------------------------------------------------------------------------------
const escapeTable = {
    '&'     : '&amp;',
    '<'     : '&lt;',
    '>'     : '&gt;',
    '"'     : '&quot;',
    "'"     : '&apos;'
}

export const escapeXml = (xmlStr : string) : string => xmlStr.replace(/[&<>"']/g, match => escapeTable[ match ])

//---------------------------------------------------------------------------------------------------------------------
// noise reducers
export const xml = (props? : Partial<XmlElement>) : XmlElement => XmlElement.new(props)

export const span = (cls : string | string[], ...childNodes : XmlNode[]) : XmlElement => XmlElement.new({ tagName : 'span', class : cls, childNodes })


//---------------------------------------------------------------------------------------------------------------------
const streamToElement   = (stream : XmlStream) : XmlElement => {
    if (isString(stream)) {
        return <span>{ stream }</span> as XmlElement
    }
    else if (stream instanceof XmlElement) {
        return stream
    }
    else {
        const nodes : XmlNode[]     = stream.flat(Number.MAX_SAFE_INTEGER)

        if (nodes.length > 1) throw new Error("Can not reduce XML stream to a single element")
        if (nodes.length === 0) throw new Error("Empty XML stream can not be reduced to a single element")

        if (isString(nodes[ 0 ]))
            return <span>{ stream }</span> as XmlElement
        else
            return nodes[ 0 ]
    }
}
