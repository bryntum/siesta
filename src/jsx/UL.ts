import { ClassUnion, Mixin } from "../class/Mixin.js"
import { serializable } from "../serializable/Serializable.js"
import { isString } from "../util/Typeguards.js"
import { RenderingFrameSequence } from "./RenderingFrame.js"
import { XmlElement, XmlNode } from "./XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "./XmlRenderer.js"


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class UL extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class UL extends base {
        tagName         : string            = 'ul'


        renderChildInner (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            const frame     = super.renderChildInner(child, index, renderer, sequence, parentContexts, ownContext)

            return !isString(child) && child.tagName.toLowerCase() === 'li'
                ?
                    frame.indent([
                        ' '.repeat(renderer.indentLevel - 2) + '· ',
                        ' '.repeat(renderer.indentLevel)
                    ])
                :
                    frame
        }
    }
) {}

