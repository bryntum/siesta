import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { isString } from "../../util/Typeguards.js"

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
            const attributesContent     = this.$attributes ? Object.entries(this.attributes).map(( [ name, value ] ) => name + '="' + escapeXml(value) + '"') : []

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
