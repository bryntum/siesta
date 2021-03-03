import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Serializable, serializable } from "../serializable/Serializable.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { TextBlock } from "./TextBlock.js"
import { TextJSX } from "./TextJSX.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "./XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
export type XmlNode = string | XmlElement

// TODO extend the TreeNode ? TreeNode needs to handle the heterogeneous child list then

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


        isChildIndented (child : XmlNode) : boolean {
            return this.hasClass('indented')
        }


        indentChildOutput (renderer : XmlRenderer, child : XmlNode, index : number, output : TextBlock) : TextBlock {
            output.indentMut(renderer.indentLevel, false)

            return output
        }

        // // TODO probably no need to return the tuple now
        // render (
        //     renderer : XmlRenderer, parentContexts : XmlRenderingDynamicContext[] = []
        // )
        //     : [ RenderingFrame, XmlRenderingDynamicContext ]
        // {
        //     const sequence              = RenderingFrameSequence.new()
        //
        //     const isBlockLevelElement   = this.getDisplayType(renderer) === 'block'
        //
        //     if (isBlockLevelElement) sequence.push(RenderingFrameOpenBlock.new())
        //
        //     //----------------
        //     const context               = renderer.createDynamicContext(this, parentContexts)
        //
        //     this.renderSelf(renderer, sequence, parentContexts, context)
        //
        //     //----------------
        //     let frame : RenderingFrame  = sequence
        //
        //     const stylingRules  = renderer.getRulesFor(this)
        //
        //     if (stylingRules.length > 0)
        //         frame           = frame.colorize(stylingRules.reduce((colorer, rule) => rule(colorer), renderer.c))
        //
        //     if (this.hasClass('indented'))
        //         frame           = frame.indent([ ' '.repeat(renderer.indentLevel) ])
        //
        //     if (isBlockLevelElement)
        //         frame           = frame.concat(RenderingFrameCloseBlock.new())
        //
        //     return [ frame, context ]
        // }


        renderToTextBlock (renderer : XmlRenderer, output : TextBlock, parentContext? : XmlRenderingDynamicContext) {
            const context               = renderer.createDynamicContext(this, parentContext)

            this.renderSelf(renderer, output, context)

            const stylingRules  = renderer.getRulesFor(this)

            if (stylingRules.length > 0)
                output.colorizeMut(stylingRules.reduce((colorer, rule) => rule(colorer), renderer.c))

            // if (this.hasClass('indented'))
            //     output.indent([ ' '.repeat(renderer.indentLevel) ])
        }


        renderSelf (
            renderer        : XmlRenderer,
            output          : TextBlock,
            context         : XmlRenderingDynamicContext
        ) {
            this.beforeRenderChildren(renderer, output, context)
            this.renderChildren(renderer, output, context)
            this.afterRenderChildren(renderer, output, context)
        }


        beforeRenderChildren (
            renderer    : XmlRenderer,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
        }


        renderChildren (renderer : XmlRenderer, output : TextBlock, context : XmlRenderingDynamicContext) {
            this.childNodes.forEach((child, index) => {
                this.beforeRenderChild(child, index, renderer, output, context)
                this.renderChild(child, index, renderer, output, context)
                this.afterRenderChild(child, index, renderer, output, context)
            })
        }


        afterRenderChildren (renderer : XmlRenderer, output : TextBlock, context : XmlRenderingDynamicContext) {
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
        }


        renderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            this.renderChildInner(child, index, renderer, output, context)
        }


        renderChildInner (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            const isBlockLevel      = isString(child) ? false : child.getDisplayType(renderer) === 'block'
            const isChildIndented   = this.isChildIndented(child)

            const childBlock    = TextBlock.new({
                maxLen      : output.maxLen - (isChildIndented ? renderer.indentLevel : 0),
                reserved    : isBlockLevel ? 0 : output.lastLine.length
            })

            if (isString(child)) {
                childBlock.push(child)
            } else {
                child.renderToTextBlock(renderer, childBlock, context)
            }

            if (isChildIndented) this.indentChildOutput(renderer, child, index, childBlock)

            if (isBlockLevel) output.openBlock()

            output.pullFrom(childBlock)

            if (isBlockLevel) output.closeBlock()
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
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
// TODO should probably be the opposite - Element should extend Fragment
//  (fragment only has child nodes, element adds the "shell" - tag name and attributes)
export class XmlFragment extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class XmlFragment extends base {
    }
){}
