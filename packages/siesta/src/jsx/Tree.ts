import { ClassUnion, Mixin } from "../class/Mixin.js"
import { serializable } from "../serializable/Serializable.js"
import { isString } from "../util/Typeguards.js"
import { TextBlock } from "./TextBlock.js"
import { XmlElement, XmlNode } from "./XmlElement.js"
import { XmlRenderer } from "./XmlRenderer.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'Tree' })
export class Tree extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class Tree extends base {
        tagName         : string            = 'tree'

        props           : XmlElement[ 'props' ] & {
            isTopLevelLastNode?     : boolean
        }


        isChildIndented (child : XmlNode) : boolean {
            return super.isChildIndented(child) || !isString(child) && child.tagName.toLowerCase() === 'leaf'
        }


        indentChildOutput (renderer : XmlRenderer, child : XmlNode, index : number, output : TextBlock) : TextBlock {
            const isTopLevelLastNode    = this.getAttribute('isTopLevelLastNode')

            const isLastNode            = index === this.childNodes.length - 1
            const isLast                = isTopLevelLastNode !== undefined ? isLastNode && isTopLevelLastNode : isLastNode

            const treeLineStyling       = renderer.styles.get('tree_line') || (c => c)

            output.indentAsTreeLeafMut(renderer.indentLevel, isLast, treeLineStyling(renderer.c))

            return output
        }
    }
) {}

