import { Base, ClassUnion, Mixin } from 'typescript-mixin-class/index.js'
import { Serializable, serializable } from "../serializable/Serializable.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { XmlRenderBlock } from "./RenderBlock.js"
import { TextJSX } from "./TextJSX.js"
import { XmlRendererStreaming } from "./XmlRenderer.js"

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


        get class () : string {
            return this.$attributes ? this.attributes.class ?? null : null
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


        getDisplayType (renderer : XmlRendererStreaming) : 'block' | 'inline' {
            return renderer.getDisplayType(this)
        }


        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // new rendering code below

        styleText (str : string, block : XmlRenderBlock) : string {
            return block.style.colorer.text(str)
        }


        styleIndentation (indent : string, block : XmlRenderBlock) : string {
            return indent
        }

        // TODO this is a bit of mess (or may be not?)
        // used for the tree lines styling
        styleChildIndentation (indent : string, childBlock : XmlRenderBlock) : string | undefined {
            return undefined
        }


        customIndentation (renderer : XmlRendererStreaming) : string[] {
            return [ this.hasClass('indented') ? ' '.repeat(renderer.indentLevel) : '' ]
        }


        childCustomIndentation (renderer : XmlRendererStreaming, child : XmlElement, index : number) : string[] {
            return undefined
        }


        renderStreaming (context : XmlRenderBlock) {
            this.startStreamingRendering(context)
            this.finishStreamingRendering(context)
        }


        startStreamingRendering (context : XmlRenderBlock) {
            this.beforeRenderContent(context)

            this.renderContent(context)
        }


        finishStreamingRendering (context : XmlRenderBlock) {
            this.afterRenderContent(context)

            this.renderStreamingDone(context)
        }


        // keeping this code separate from `afterRenderContent` to let user override that method
        // this code should be executed after all `afterRenderContent` activity is completed
        renderStreamingDone (context : XmlRenderBlock) {
            if (context.type === 'block') {
                context.flushInlineBuffer()
                // when the rendering of the block-level element has complete,
                // need to insert pending new line into canvas
                context.canvas.newLinePending()
            }
        }


        beforeRenderContent (context : XmlRenderBlock) {
        }


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
