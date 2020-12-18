import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { styles } from "./styling/terminal.js"
import { Colorer } from "./Colorer.js"
import { TextBlock } from "./Reporter.js"


//---------------------------------------------------------------------------------------------------------------------
export type ColorerRule = (c : Colorer) => Colorer


//---------------------------------------------------------------------------------------------------------------------
export class Printer extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Printer extends base {
        styles      : Map<string, ColorerRule>  = styles

        c           : Colorer       = undefined

        treeIndentationLevel        : number    = 2

        blockLevelElements          : Set<string> = new Set([
            'div', 'ul', 'unl', 'li', 'tree', 'leaf', 'p'
        ])


        print (str : string) {
            throw new Error("Abstract method")
        }


        render (el : XmlNode) : TextBlock {
            if (isString(el)) {
                const res   = TextBlock.new()

                res.push(el)

                return res
            } else {
                const res   = TextBlock.new()

                let context : 'inline' | 'opened_block' | 'closed_block' = 'opened_block'

                el.childNodes.forEach((node, index, array) => {
                    // TODO last node can be a string?
                    const isLast        = index === array.length - 1
                    const block         = this.render(node)

                    if (el.tagName === 'ul' && !isString(node) && node.tagName === 'li') {
                        block.indentMut(this.treeIndentationLevel, true)
                    }

                    if (el.tagName === 'unl' && !isString(node) && node.tagName === 'li') {
                        block.indentMut(this.treeIndentationLevel, false)
                    }

                    if (el.tagName === 'tree' && !isString(node) && node.tagName === 'leaf') {
                        block.indentAsTreeLeafMut(this.treeIndentationLevel, isLast)
                    }

                    if (this.getDisplayType(node) === 'inline') {
                        context         = 'inline'
                    } else {
                        if (context === 'inline' || context === 'closed_block') {
                            context         = 'closed_block'

                            block.text.unshift([])
                        } else if (context === 'opened_block') {
                            context         = 'closed_block'
                        }
                    }

                    res.pullFrom(block)
                })

                res.colorizeMut(this.getRulesFor(el).reduce((colorer, rule) => rule(colorer), this.c))

                return res
            }
        }


        getDisplayType (el : XmlNode) : 'block' | 'inline' {
            if (isString(el)) {
                return 'inline'
            } else {
                if (this.blockLevelElements.has(el.tagName))
                    return 'block'
                else
                    return 'inline'
            }
        }


        getRulesFor (el : XmlElement) : ColorerRule[] {
            return saneSplit(el.attributes.class ?? '', /\s+/)
                .map(className => this.styles.get(className))
                .filter(rule => Boolean(rule))
        }


        write (el : XmlElement) {
            this.print(this.render(el).toString())
        }
    }
){}
