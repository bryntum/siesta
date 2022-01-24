import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Colorer, ColorerRule } from "./Colorer.js"
import { ColorerNoop } from "./ColorerNoop.js"
import { RenderCanvas, XmlRenderBlock } from "./RenderBlock.js"
import { TextBlock } from "./TextBlock.js"
import { XmlElement, XmlNode } from "./XmlElement.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TODO rename to XmlRenderingStaticContext
export class XmlRenderer extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderer extends base {
        styles                  : Map<string, ColorerRule>  = new Map()

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


        getRulesFor (el : XmlElement) : ColorerRule[] {
            const rules = saneSplit(el.attributes.class ?? '', /\s+/)
                .map(className => this.styles.get(className))
                .filter(rule => Boolean(rule))

            if (el.hasClass('underlined')) rules.push(c => c.underline)

            return rules
        }


        createDynamicContext (element : XmlElement, parentContext : XmlRenderingDynamicContext) : XmlRenderingDynamicContext {
            return XmlRenderingDynamicContext.new({ parentContext, element })
        }


        render (el : XmlElement, textBlock? : TextBlock) : string {
            return this.renderToTextBlock(el, textBlock).toString()
        }


        renderToTextBlock (el : XmlElement, textBlock : TextBlock = TextBlock.new()) : TextBlock {
            el.renderToTextBlock(this, textBlock)

            return textBlock
        }
    }
){}


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
export class XmlRendererStreaming extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderer extends base {
        styles                  : Map<string, ColorerRule>  = new Map()

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


        getRulesFor (el : XmlElement) : ColorerRule[] {
            const rules = saneSplit(el.attributes.class ?? '', /\s+/)
                .map(className => this.styles.get(className))
                .filter(rule => Boolean(rule))

            if (el.hasClass('underlined')) rules.push(c => c.underline)

            return rules
        }


        render (el : XmlElement, canvas? : RenderCanvas) : string {
            return this.renderToCanvas(el, canvas).toString()
        }


        style (str : string, el : XmlElement) : string {
            const stylingRules  = this.getRulesFor(el)

            const colorer       = stylingRules.reduce((colorer, rule) => rule(colorer), this.c)

            return colorer.text(str)
        }


        renderToCanvas (el : XmlElement, canvas : RenderCanvas = RenderCanvas.new()) : RenderCanvas {
            const rootBlock     = XmlRenderBlock.new({
                canvas, parentBlock : undefined, renderer : this, element : XmlElement.new({ tagName : 'div' })
            })

            el.renderStreaming(rootBlock.deriveChildBlock(el))

            rootBlock.flushInlineBuffer()

            return canvas
        }
    }
){}
