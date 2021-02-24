import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Serializable, serializable } from "../serializable/Serializable.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { ColoredStringPlain } from "./ColoredString.js"
import { TextJSX } from "./TextJSX.js"
import { RenderingFrame, RenderingFrameContent, RenderingFrameNoop, RenderingFrameSequence, RenderingFrameStartBlock } from "./RenderingFrame.js"
import { XmlRenderer } from "./XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
export type XmlNode = string | XmlElement

// TODO extend the TreeNode

@serializable()
export class XmlElement extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class XmlElement extends base {
        props           : object

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


        getDisplayType (renderer : XmlRenderer) : 'block' | 'inline' {
            return renderer.getDisplayType(this)
        }


        render (renderer : XmlRenderer) : RenderingFrame {
            const sequence      = RenderingFrameSequence.new()

            if (this.getDisplayType(renderer) === 'block') sequence.push(RenderingFrameStartBlock.new())

            if (this.childNodes.length) sequence.push(this.renderChildren(renderer))

            let frame : RenderingFrame  = sequence

            const stylingRules  = renderer.getRulesFor(this)

            if (this.hasClass('underlined')) stylingRules.push(c => c.underline)

            if (stylingRules.length > 0) frame = frame.colorize(stylingRules.reduce((colorer, rule) => rule(colorer), renderer.c))

            if (this.hasClass('indented')) frame = frame.indent([ ' '.repeat(renderer.indentLevel) ])

            return frame
        }


        renderChildren (renderer : XmlRenderer) : RenderingFrame {
            const sequence      = RenderingFrameSequence.new()

            this.childNodes.forEach(child => {
                sequence.push(isString(child)
                    ?
                        RenderingFrameContent.new({ content : ColoredStringPlain.fromString(child) })
                    :
                        child.render(renderer)
                )
            })

            return sequence
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
// TODO should probably be the opposite - Element extends Fragment
//  (fragment only has childNodes, element adds the "shell" - tag name and attributes)
export class XmlFragment extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class XmlFragment extends base {
    }
){}
