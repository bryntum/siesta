import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Serializable, serializable } from "../serializable/Serializable.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Line, RenderCanvas, XmlRenderBlock } from "./RenderBlock.js"
import { TextBlock } from "./TextBlock.js"
import { TextJSX } from "./TextJSX.js"
import { XmlRenderer, XmlRendererStreaming, XmlRenderingDynamicContext } from "./XmlRenderer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type XmlNode = string | XmlElement

// TODO extend the TreeNode ? TreeNode needs to handle the heterogeneous child list then

@serializable({ id : 'XmlElement' })
export class XmlElement extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class XmlElement extends base {
        props           : Record<string, unknown> & { class? : string }

        parent          : XmlElement                = undefined

        childNodes      : XmlNode[]                 = []

        tagName         : string                    = ''

        $attributes     : this[ 'props' ]           = undefined

        get attributes () : this[ 'props' ] {
            if (this.$attributes !== undefined) return this.$attributes

            return this.$attributes = {}
        }

        set attributes (value : this[ 'props' ]) {
            this.$attributes = value === null
                ?
                    undefined
                :
                    Object.fromEntries(Object.entries(value).filter(entry => entry[ 1 ] !== undefined))
        }


        set class (value : string | string[]) {
            this.attributes.class   = isString(value) ? value : value.join(' ')
        }


        $depth           : number    = undefined

        get depth () : number {
            if (this.$depth !== undefined) return this.$depth

            let depth                   = 0
            let node : XmlElement       = this

            while (node.parent) { node = node.parent; depth++ }

            return this.$depth = depth
        }


        initialize (props? : Partial<XmlElement>) {
            super.initialize(props)

            this.childNodes && this.adoptChildren(this.childNodes)
        }


        adoptChildren (children : XmlNode[]) {
            children.forEach(child => {
                if (child instanceof XmlElement) child.parent = this
            })
        }


        toString () : string {
            const childrenContent       = this.childNodes ? this.childNodes.map(child => child.toString()) : []
            const attributesContent     = this.$attributes
                ?
                    Object.entries(this.attributes)
                        .filter(entry => entry[ 1 ] !== undefined)
                        .map(( [ name, value ] ) => name + '="' + escapeXml(String(value)) + '"')
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
            if (value === undefined) {
                delete this.attributes[ name ]
            } else
                this.attributes[ name ] = value
        }


        * parentAxis () : Generator<XmlElement> {
            let el : XmlElement     = this

            while (el.parent) {
                yield el.parent

                el                  = el.parent
            }
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


        renderToTextBlock (renderer : XmlRenderer, output : TextBlock, parentContext? : XmlRenderingDynamicContext) {
            const context               = renderer.createDynamicContext(this, parentContext)

            this.renderSelf(renderer, output, context)

            this.colorizeSelf(renderer, output, context)
        }


        colorizeSelf (renderer : XmlRenderer, output : TextBlock, context : XmlRenderingDynamicContext) {
            const stylingRules  = renderer.getRulesFor(this)

            if (stylingRules.length > 0)
                output.colorizeMut(stylingRules.reduce((colorer, rule) => rule(colorer), renderer.c))
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


        renderChildren (
            renderer    : XmlRenderer,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
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
                maxLen      : output.maxLen - (isChildIndented ? renderer.indentLevel : 0) - output.currentIndentation.length,
                reserved    : isBlockLevel ? 0 : output.lastLineContentLength
            })

            if (isString(child)) {
                childBlock.push(child)
            } else {
                child.renderToTextBlock(renderer, childBlock, context)
            }

            if (isChildIndented) this.indentChildOutput(renderer, child, index, childBlock)

            // this.colorizeChild(child, index, renderer, childBlock, context)

            if (isBlockLevel) output.openBlock()

            output.pullFrom(childBlock)

            if (isBlockLevel) output.closeBlock()
        }


        // colorizeChild (
        //     child               : XmlNode,
        //     index               : number,
        //     renderer            : XmlRenderer,
        //     childBlock          : TextBlock,
        //     context             : XmlRenderingDynamicContext
        // ) {
        // }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
        }


        styleText (str : string, block : XmlRenderBlock) : string {
            return block.style.colorer.text(str)
        }


        styleIndentation (indent : string, block : XmlRenderBlock) : string {
            return indent
        }


        customIndentation (renderer : XmlRendererStreaming) : string[] {
            return [ this.hasClass('indented') ? ' '.repeat(renderer.indentLevel) : '' ]
        }


        childCustomIndentation (renderer : XmlRendererStreaming, child : XmlElement, index : number) : string[] {
            return undefined
        }


        renderStreaming (context : XmlRenderBlock) {
            this.beforeRenderContent(context)
            this.renderContent(context)
            this.afterRenderContent(context)

            this.renderStreamingDone(context)
        }

        // keeping this code separate from `afterRenderContent` to let user override that method
        // this code should be executed after all `afterRenderContent` activity is completed
        renderStreamingDone (context : XmlRenderBlock) {
            context.flushInlineBuffer()

            // when the rendering of the block-level element has complete,
            // need to insert pending new line into canvas
            if (context.type === 'block') context.canvas.newLinePending()
        }


        beforeRenderContent (context : XmlRenderBlock) {
        }


        // should NOT be overridden by user - it is by the `RenderingXmlFragmentWithCanvas`
        // for the rendering of the initial content, there still might be calls to
        // `renderChildStreaming` after the call to this method (for the following incremental rendering)
        renderContent (context : XmlRenderBlock) {
            this.childNodes.forEach((child, index) => {
                this.beforeRenderChildStreaming(context, child, index)
                this.renderChildStreaming(context, child, index)
                this.afterRenderChildStreaming(context, child, index)
            })
        }


        afterRenderContent (context : XmlRenderBlock) {
        }


        beforeRenderChildStreaming (context : XmlRenderBlock, child : XmlNode, index : number) {
        }


        // should NOT be overridden by user - it is not used during incremental rendering
        // performed with the `RenderingXmlFragmentWithCanvas`
        renderChildStreaming (context : XmlRenderBlock, child : XmlNode, index : number) {
            if (isString(child)) {
                context.write(child)
            } else {
                child.renderStreaming(context.deriveChildBlock(child, index))
            }
        }


        afterRenderChildStreaming (context : XmlRenderBlock, child : XmlNode, index : number) {
        }
    }
){}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const escapeTable = {
    '&'     : '&amp;',
    '<'     : '&lt;',
    '>'     : '&gt;',
    '"'     : '&quot;',
    "'"     : '&apos;'
}

export const escapeXml = (xmlStr : string) : string => xmlStr.replace(/[&<>"']/g, match => escapeTable[ match ])


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TODO should probably be the opposite - Element should extend Fragment
//  (fragment only has child nodes, element adds the "shell" - tag name and attributes)
export class XmlFragment extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class XmlFragment extends base {
    }
){}
