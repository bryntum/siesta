import { ClassUnion, Mixin } from "../class/Mixin.js"
import { serializable } from "../serializable/Serializable.js"
import { isString } from "../util/Typeguards.js"
import { TextBlock } from "./TextBlock.js"
import { XmlElement, XmlNode } from "./XmlElement.js"
import { XmlRenderer } from "./XmlRenderer.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'UL' })
export class UL extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class UL extends base {
        tagName         : string            = 'ul'


        isChildIndented (child : XmlNode) : boolean {
            return super.isChildIndented(child) || !isString(child) && child.tagName.toLowerCase() === 'li'
        }


        indentChildOutput (renderer : XmlRenderer, child : XmlNode, index : number, output : TextBlock) : TextBlock {
            output.indentMut(renderer.indentLevel, true)

            return output
        }
    }
) {}

