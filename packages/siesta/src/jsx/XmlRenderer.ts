import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Colorer } from "./Colorer.js"
import { ColorerNoop } from "./ColorerNoop.js"
import { RenderCanvas, Style, XmlRenderBlock } from "./RenderBlock.js"
import { XmlElement, XmlNode } from "./XmlElement.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRenderingDynamicContext extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderingDynamicContext extends base {
        parentContext   : this              = undefined

        element         : XmlElement        = undefined
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// should mutate the `style` object
export type StyleRule   = (style : Style) => any


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRendererStreaming extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderer extends base {
        styles                  : Map<string, StyleRule>  = new Map()

        indentLevel             : number        = 2

        blockLevelElements      : Set<string>   = new Set([
            'div', 'ul', 'li', 'tree', 'leaf', 'p'
        ])


        colorerClass            : typeof Colorer    = ColorerNoop

        $c                      : Colorer   = undefined

        get c () : Colorer {
            if (this.$c !== undefined) return this.$c

            return this.$c  = this.colorerClass.new()
        }


        getDisplayType (el : XmlNode) : 'block' | 'inline' {
            if (isString(el)) {
                return 'inline'
            } else {
                return this.blockLevelElements.has(el.tagName?.toLowerCase()) ? 'block' : 'inline'
            }
        }

        // extensibility hook
        getElementClass (el : XmlElement) : string {
            return el.class
        }


        customIndentation (block : XmlRenderBlock) : string[] {
            return undefined
        }


        applyStyleRules (block : XmlRenderBlock) {
            const el        = block.element

            saneSplit(this.getElementClass(el) ?? '', /\s+/).forEach(className => {
                const rule     = this.styles.get(className)

                if (rule) rule(block.style)
            })

            if (el.hasClass('underlined')) block.style.underline = true
        }


        render (el : XmlElement, canvas? : RenderCanvas) : string {
            return this.renderToCanvas(el, canvas).toString()
        }


        renderToCanvas (el : XmlElement, canvas : RenderCanvas = RenderCanvas.new()) : RenderCanvas {
            const rootBlock     = XmlRenderBlock.new({
                canvas, renderer : this, element : XmlElement.new({ tagName : 'div' }), maxWidth : canvas.maxWidth
            })

            el.renderStreaming(rootBlock.deriveChildBlock(el, 0))

            rootBlock.flushInlineBuffer()

            return canvas
        }
    }
){}
