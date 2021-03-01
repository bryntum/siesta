import { ClassUnion, Mixin } from "../class/Mixin.js"
import { serializable } from "../serializable/Serializable.js"
import { isString } from "../util/Typeguards.js"
import { ColoredStringPlain } from "./ColoredString.js"
import { RenderingFrameSequence } from "./RenderingFrame.js"
import { XmlElement, XmlNode } from "./XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "./XmlRenderer.js"


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class Tree extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class Tree extends base {
        tagName         : string            = 'tree'

        props           : XmlElement[ 'props' ] & {
            isTopLevelLastNode?     : boolean
        }

        renderChildInner (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            const frame     = super.renderChildInner(child, index, renderer, sequence, parentContexts, ownContext)

            const isTopLevelLastNode    = this.getAttribute('isTopLevelLastNode')

            if (isString(child) )
                return frame
            else if (child.tagName.toLowerCase() !== 'leaf')
                return frame
            else {
                const isLastNode        = index === this.childNodes.length - 1
                const isLast            = isTopLevelLastNode !== undefined ? isLastNode && isTopLevelLastNode : isLastNode

                const indenterPlain     = ' '.repeat(renderer.indentLevel - 1)
                const indenterTree      = '─'.repeat(renderer.indentLevel - 1)

                return frame.indent([
                    ColoredStringPlain.fromString(isLast ? '└' + indenterTree : '├' + indenterTree, renderer.styles.get('tree_line')(renderer.c)),
                    ColoredStringPlain.fromString(isLast ? ' ' + indenterPlain : '│' + indenterPlain, renderer.styles.get('tree_line')(renderer.c))
                ])
            }
        }
    }
) {}

