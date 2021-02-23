import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Serializable, serializable } from "../serializable/Serializable.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { SiestaJSX } from "./Factory.js"
import { RenderingBuffer } from "./RenderingBuffer.js"
import { RenderingFrame } from "./RenderingFrame.js"
import { XmlRenderer } from "./XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
export type XmlNode = string | XmlElement


@serializable()
export class XmlElement extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class XmlElement extends base {
        props           : this

        parent          : XmlElement                = undefined

        childNodes      : XmlNode[]                 = []

        tagName         : string                    = ''

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


        initialize (props? : Partial<XmlElement>) {
            super.initialize(props)

            this.adoptChildren(this.childNodes)
        }


        adoptChildren (children : XmlNode[]) {
            children.forEach(child => {
                if (child instanceof XmlElement) child.parent = this
            })
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


        appendChild (...children : XmlNode[]) : XmlNode[] {
            this.childNodes.push(...children.flat(Number.MAX_SAFE_INTEGER))

            this.adoptChildren(children)

            return children
        }


        getAttribute (name : string) : any {
            return this.$attributes ? this.attributes[ name ] : undefined
        }


        setAttribute (name : string, value : any) {
            this.attributes[ name ] = value
        }


        hasClass (clsName : string) : boolean {
            return saneSplit(this.attributes.class ?? '', /\s+/).some(cls => cls === clsName)
        }


        render (buffer : RenderingBuffer) {
            // this.childNodes.forEach(child => {
            //     if (isString(child)) buffer.push
            // })
        }


        renderingFrame (renderer : XmlRenderer) : RenderingFrame {
            return
            // this.childNodes.forEach(child => {
            //     if (isString(child)) buffer.push
            // })
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
export class XmlFragment extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class XmlFragment extends base {
    }
){}
