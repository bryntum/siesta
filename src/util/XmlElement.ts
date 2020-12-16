import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Serializable, serializable } from "../serializable/Serializable.js"
import { isString } from "./Typeguards.js"

//---------------------------------------------------------------------------------------------------------------------
export type XmlNode = XmlElement | string

@serializable('XmlElement')
export class XmlElement extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class XmlElement extends base {
        childNodes      : XmlNode[]                 = []

        tag             : string                    = 'tag'
        attributes      : { [ key : string ] : string } = {}


        set class (value : string | string[]) {
            this.attributes.class   = isString(value) ? value : value.join(' ')
        }


        toString () : string {
            const childrenContent       = this.childNodes.map(child => child.toString())
            const attributesContent     = Object.entries(this.attributes).map(( [ name, value ] ) => name + '="' + escapeXml(value) + '"')

            // to have predictable order of attributes in tests
            attributesContent.sort()

            return `<${ this.tag }${ attributesContent.length > 0 ? ' ' + attributesContent.join(' ') : '' }>${ childrenContent.join('') }</${ this.tag }>`
        }


        appendChild (...child : XmlNode[]) : XmlNode[] {
            this.childNodes.push(...child)

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

export const span = (cls : string | string[], ...childNodes : XmlNode[]) : XmlElement => XmlElement.new({ tag : 'span', class : cls, childNodes })
