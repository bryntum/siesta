import { ClassUnion, Mixin } from "../class/Mixin.js"
import { serializable } from "../serializable/Serializable.js"
import { XmlRenderBlock } from "./RenderBlock.js"
import { XmlElement } from "./XmlElement.js"
import { XmlRendererStreaming } from "./XmlRenderer.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'TreeStreamed' })
export class TreeStreamed extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class TreeStreamed extends base {
        tagName         : string            = 'tree'

        props           : XmlElement[ 'props' ] & {
            isTopLevelLastNode?     : boolean
        }


        styleChildIndentation (indent : string, childBlock : XmlRenderBlock) : string | undefined {
            // TODO should actually apply the `tree_line` class styling
            return childBlock.renderer.c.gray.text(indent)
        }


        childCustomIndentation (renderer : XmlRendererStreaming, child : XmlElement, index : number) : string[] {
            if (child.tagName.toLowerCase() !== 'leaf') return undefined

            const isTopLevelLastNode    = this.getAttribute('isTopLevelLastNode')

            const indentLevel           = renderer.indentLevel
            const isLastNode            = index === this.childNodes.length - 1
            const isLast                = isTopLevelLastNode !== undefined ? isLastNode && isTopLevelLastNode : isLastNode

            const indenterTree          = '─'.repeat(indentLevel - 1)
            const indenterPlain         = ' '.repeat(indentLevel - 1)

            return [
                isLast ? ' ' + indenterPlain : '│' + indenterPlain,
                isLast ? '└' + indenterTree : '├' + indenterTree
            ]
        }
    }
) {}

