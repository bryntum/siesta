import { ClassUnion, Mixin } from "../class/Mixin.js"
import { serializable } from "../serializable/Serializable.js"
import { XmlElement } from "./XmlElement.js"
import { XmlRendererStreaming } from "./XmlRenderer.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'ULStreamed' })
export class ULStreamed extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class UL extends base {
        tagName         : string            = 'ul'


        childCustomIndentation (renderer : XmlRendererStreaming, child : XmlElement) : string[] {
            if (child.tagName.toLowerCase() !== 'li') return undefined

            const indentLevel   = renderer.indentLevel

            return [
                ' '.repeat(indentLevel),
                ' '.repeat(indentLevel - 2) + '· '
            ]
        }
    }
) {}

