import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { Colorer } from "./Colorer.js"
import { TextBlock } from "./Reporter.js"


//---------------------------------------------------------------------------------------------------------------------
export type ColorerRule = (c : Colorer) => Colorer

//---------------------------------------------------------------------------------------------------------------------
export class StyleMap extends Base {
    styles      : Map<string, ColorerRule>     = new Map()

    add (className : string, rule : ColorerRule) {
        this.styles.set(className, rule)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class Printer extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Printer extends base {
        styles      : StyleMap      = defaultStyles

        c           : Colorer       = undefined

        treeIndentationLevel        : number    = 2


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
                        block.indentMut(this.treeIndentationLevel)
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
                if (el.tagName === 'div' || el.tagName === 'ul' || el.tagName === 'li' || el.tagName === 'tree' || el.tagName === 'leaf')
                    return 'block'
                else
                    return 'inline'
            }
        }


        getRulesFor (el : XmlElement) : ColorerRule[] {
            return saneSplit(el.attributes.class ?? '', /\s+/)
                .map(className => this.styles.styles.get(className))
                .filter(rule => Boolean(rule))
        }


        write (el : XmlElement) {
            this.print(this.render(el).toString())
        }
    }
){}




const defaultStyles = StyleMap.new()

defaultStyles.add('assertion', c => c.keyword('gray'))
defaultStyles.add('assertion_name', c => c.keyword('white'))
defaultStyles.add('assertion_source', c => c.keyword('gray'))
defaultStyles.add('assertion_source_line', c => c.keyword('yellow'))
defaultStyles.add('assertion_source_file', c => c.keyword('cyan'))
defaultStyles.add('difference', c => c.keyword('gray'))
defaultStyles.add('difference_key_path', c => c.keyword('white'))

defaultStyles.add('test_file_pass', c => c.keyword('green').inverse)
defaultStyles.add('test_file_fail', c => c.keyword('red').inverse)

defaultStyles.add('sub_test_pass', c => c.keyword('green'))
defaultStyles.add('sub_test_fail', c => c.keyword('red'))

