import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { styles } from "../siesta/reporter/styling/terminal.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Colorer, ColorerRule } from "./Colorer.js"
import { ColorerNoop } from "./ColorerNoop.js"
import { TextBlock } from "./TextBlock.js"
import { XmlElement, XmlNode } from "./XmlElement.js"


//---------------------------------------------------------------------------------------------------------------------
// TODO rename to XmlRenderingStaticContext
export class XmlRenderer extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderer extends base {
        styles                  : Map<string, ColorerRule>  = styles

        indentLevel             : number        = 2

        blockLevelElements      : Set<string>   = new Set([
            'div', 'ul', 'unl', 'li', 'tree', 'leaf', 'p'
        ])


        colorerClass            : typeof Colorer    = ColorerNoop

        $c                      : Colorer   = undefined

        get c () : Colorer {
            if (this.$c !== undefined) return this.$c

            return this.$c  = this.colorerClass.new()
        }


        isSubBlockIndented (el : XmlElement, node : XmlNode) : boolean {
            if (el.tagName === 'ul' && !isString(node) && node.tagName === 'li') {
                return true
            }

            if (el.tagName === 'unl' && !isString(node) && node.tagName === 'li') {
                return true
            }

            if (el.tagName === 'tree' && !isString(node) && node.tagName === 'leaf') {
                return true
            }

            return false
        }


        render (el : XmlNode, maxLen : number = Number.MAX_SAFE_INTEGER, reserved : number = 0) : TextBlock {
            if (isString(el)) {
                const res   = TextBlock.new({ maxLen, reserved })

                res.push(el)

                return res
            }
            else if (el.tagName === 'serialization') {
                return this.renderToTextBlock(el, TextBlock.new({ maxLen, indentLevel : this.indentLevel, reserved }))
                // return StringifierXml.stringifyToTextBlock(el, { maxLen, prettyPrint : true, indentLevel : this.indentLevel })
            } else {
                const res           = TextBlock.new({ maxLen, indentLevel : this.indentLevel, reserved })

                const isIndented    = el.hasClass('indented')

                if (isIndented) res.indent()

                let context : 'inline' | 'opened_block' | 'closed_block' = 'opened_block'

                el.childNodes.forEach((node, index, array) => {
                    const isLast        = index === array.length - 1

                    if (this.getDisplayType(node) === 'inline') {
                        context             = 'inline'
                    } else {
                        if (context === 'inline' || context === 'closed_block') {
                            context         = 'closed_block'

                            res.addNewLine()
                        } else if (context === 'opened_block') {
                            context         = 'closed_block'
                        }
                    }

                    const block         = this.render(
                        node,
                        maxLen
                            - (this.isSubBlockIndented(el, node) ? this.indentLevel : 0)
                            - (isIndented ? this.indentLevel : 0),
                        context === 'inline' ? res.lastLine.length : 0
                    )

                    if (el.tagName === 'ul' && !isString(node) && node.tagName === 'li') {
                        block.indentMut(this.indentLevel, true)
                    }

                    if (el.tagName === 'unl' && !isString(node) && node.tagName === 'li') {
                        block.indentMut(this.indentLevel, false)
                    }

                    if (el.tagName === 'tree' && !isString(node) && node.tagName === 'leaf') {
                        // @ts-ignore
                        const attr          = el.getAttribute('isTopLevelLastNode')

                        const isLastNode    = attr !== null ? attr && isLast : isLast

                        block.indentAsTreeLeafMut(this.indentLevel, isLastNode, this.styles.get('tree_line')(this.c))
                    }

                    res.pullFrom(block)
                })

                const rules     = this.getRulesFor(el)

                if (el.hasClass('underlined')) rules.push(c => c.underline)

                if (rules.length > 0) res.colorizeMut(rules.reduce((colorer, rule) => rule(colorer), this.c))

                return res
            }
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


        createDynamicContext (element : XmlElement, parentContexts : XmlRenderingDynamicContext[]) : XmlRenderingDynamicContext {
            return XmlRenderingDynamicContext.new({ element })
        }


        // TODO rename to just `render`
        renderToString (el : XmlElement, textBlock? : TextBlock) : string {
            return this.renderToTextBlock(el, textBlock).toString()
        }


        renderToTextBlock (el : XmlElement, textBlock : TextBlock = TextBlock.new()) : TextBlock {
            el.render(this)[ 0 ].toTextBlock(textBlock)

            return textBlock
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class XmlRenderingDynamicContext extends Mixin(
    [ XmlRenderer ],
    (base : ClassUnion<typeof XmlRenderer>) =>

    class XmlRenderingDynamicContext extends base {
        element         : XmlElement        = undefined
    }
){}
