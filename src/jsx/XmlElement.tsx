import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Serializable, serializable } from "../serializable/Serializable.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { ColoredStringPlain } from "./ColoredString.js"
import { RenderingFrame, RenderingFrameContent, RenderingFrameSequence, RenderingFrameStartBlock } from "./RenderingFrame.js"
import { TextJSX } from "./TextJSX.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "./XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
export type XmlNode = string | XmlElement

// TODO extend the TreeNode

@serializable()
export class XmlElement extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) => {

    class XmlElement extends base {
        props           : { class? : string }

        parent          : XmlElement                = undefined

        childNodes      : XmlNode[]                 = []

        tagName         : string                    = ''

        $attributes     : this[ 'props' ]           = undefined

        get attributes () : this[ 'props' ] {
            if (this.$attributes !== undefined) return this.$attributes

            return this.$attributes = {}
        }

        set attributes (value : this[ 'props' ]) {
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


        getAttribute<T extends keyof this[ 'props' ]> (name : T) : this[ 'props' ][ T ] {
            return this.$attributes ? this.attributes[ name ] : undefined
        }


        setAttribute<T extends keyof this[ 'props' ]> (name : T, value : this[ 'props' ][ T ]) {
            this.attributes[ name ] = value
        }


        hasClass (clsName : string) : boolean {
            return saneSplit(this.attributes.class ?? '', /\s+/).some(cls => cls === clsName)
        }


        getDisplayType (renderer : XmlRenderer) : 'block' | 'inline' {
            return renderer.getDisplayType(this)
        }


        render (
            renderer : XmlRenderer, parentContexts : XmlRenderingDynamicContext[] = []
        )
            : [ RenderingFrame, XmlRenderingDynamicContext ]
        {
            const sequence              = RenderingFrameSequence.new()

            if (this.getDisplayType(renderer) === 'block') sequence.push(RenderingFrameStartBlock.new())

            //----------------
            const context               = renderer.createDynamicContext(this, parentContexts)

            this.renderSelf(renderer, sequence, parentContexts, context)

            //----------------
            let frame : RenderingFrame  = sequence

            const stylingRules  = renderer.getRulesFor(this)

            if (stylingRules.length > 0)
                frame           = frame.colorize(stylingRules.reduce((colorer, rule) => rule(colorer), renderer.c))

            if (this.hasClass('indented'))
                frame           = frame.indent([ ' '.repeat(renderer.indentLevel) ])

            return [ frame, context ]
        }


        renderSelf (
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            this.beforeRenderChildren(renderer, sequence, parentContexts, ownContext)
            this.renderChildren(renderer, sequence, parentContexts, ownContext)
            this.afterRenderChildren(renderer, sequence, parentContexts, ownContext)
        }


        beforeRenderChildren (
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
        }


        renderChildren (
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            this.childNodes.forEach((child, index) => {
                this.beforeRenderChild(child, index, renderer, sequence, parentContexts, ownContext)
                this.renderChild(child, index, renderer, sequence, parentContexts, ownContext)
                this.afterRenderChild(child, index, renderer, sequence, parentContexts, ownContext)
            })
        }


        afterRenderChildren (
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
        }


        renderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.push(isString(child)
                ?
                    RenderingFrameContent.new({ content : ColoredStringPlain.fromString(child) })
                :
                    child.render(renderer, [ ...parentContexts, ownContext ])[ 0 ]
            )
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
        }
    }

    return XmlElement
}){}

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
