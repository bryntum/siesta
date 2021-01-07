import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { Colorer, ColorerRule } from "./Colorer.js"
import { ColorerNoop } from "./ColorerNoop.js"
import { styles } from "./styling/terminal.js"


//---------------------------------------------------------------------------------------------------------------------
export class TextBlock extends Base {
    text            : string[][]        = [ [] ]


    addSameLineText (str : string) {
        this.text[ this.text.length - 1 ].push(str)
    }


    addNewLine () {
        this.text.push([])
    }


    push (...strings : string[]) {
        strings.forEach(string => saneSplit(string, '\n').forEach((str, index, array) => {
            this.addSameLineText(str)

            if (index !== array.length - 1) this.addNewLine()
        }))
    }


    pushLn (...strings : string[]) {
        this.push(...strings, '\n')
    }


    pullFrom (another : TextBlock) {
        const [ firstLine, ...otherLines ]  = another.text

        this.text[ this.text.length - 1 ].push(...firstLine)

        this.text.push(...otherLines)
    }


    toString () : string {
        return this.text.map(parts => parts.join('')).join('\n')
    }


    colorizeMut (c : Colorer) {
        this.text.forEach((line, index) => this.text[ index ] = [ c.text(line.join('')) ])
    }


    indentMut (howMany : number, includeMarker : boolean = true) {
        const indenter              = ' '.repeat(howMany)
        const indenterWithMarker    = ' '.repeat(howMany - 2) + '· '

        this.text.forEach((line, index) => {
            if (index === 0 && includeMarker) {
                line.unshift(indenterWithMarker)
            } else {
                line.unshift(indenter)
            }
        })
    }


    indentAsTreeLeafMut (howMany : number, isLast : boolean, c : Colorer) {
        const indenterPlain     = ' '.repeat(howMany - 1)
        const indenterTree      = '─'.repeat(howMany - 1)

        this.text.forEach((line, index) => {
            if (index === 0) {
                line.unshift(c.text(isLast ? '└' + indenterTree : '├' + indenterTree))
            } else {
                line.unshift(c.text(isLast ? ' ' + indenterPlain : '│' + indenterPlain))
            }
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class XmlRenderer extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderer extends base {
        styles      : Map<string, ColorerRule>  = styles

        c           : Colorer       = ColorerNoop.new()

        treeIndentationLevel        : number    = 2

        blockLevelElements          : Set<string> = new Set([
            'div', 'ul', 'unl', 'li', 'tree', 'leaf', 'p'
        ])


        render (el : XmlNode) : TextBlock {
            const res   = TextBlock.new()

            if (isString(el)) {
                res.push(el)
            } else {
                let context : 'inline' | 'opened_block' | 'closed_block' = 'opened_block'

                el.childNodes.forEach((node, index, array) => {
                    const isLast        = index === array.length - 1
                    const block         = this.render(node)

                    if (el.tagName === 'ul' && !isString(node) && node.tagName === 'li') {
                        block.indentMut(this.treeIndentationLevel, true)
                    }

                    if (el.tagName === 'unl' && !isString(node) && node.tagName === 'li') {
                        block.indentMut(this.treeIndentationLevel, false)
                    }

                    if (el.tagName === 'tree' && !isString(node) && node.tagName === 'leaf') {
                        const attr          = el.getAttribute('isLastNode')

                        const isLastNode    = attr !== undefined ? attr && isLast : isLast

                        block.indentAsTreeLeafMut(this.treeIndentationLevel, isLastNode, this.styles.get('tree_line')(this.c))
                    }

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

                    res.pullFrom(block)
                })

                res.colorizeMut(this.getRulesFor(el).reduce((colorer, rule) => rule(colorer), this.c))
            }

            return res
        }


        getDisplayType (el : XmlNode) : 'block' | 'inline' {
            if (isString(el)) {
                return 'inline'
            } else {
                return this.blockLevelElements.has(el.tagName) ? 'block' : 'inline'
            }
        }


        getRulesFor (el : XmlElement) : ColorerRule[] {
            return saneSplit(el.attributes.class ?? '', /\s+/)
                .map(className => this.styles.get(className))
                .filter(rule => Boolean(rule))
        }
    }
){}
