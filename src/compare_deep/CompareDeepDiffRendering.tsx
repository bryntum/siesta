import { ClassUnion, Mixin } from "../class/Mixin.js"
import { zip2 } from "../iterator/Iterator.js"
import { RenderingFrame, RenderingFrameSequence } from "../jsx/RenderingFrame.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { Serialization, SerializationArray, XmlRendererSerialization } from "../serializer/SerializerElements.js"
import { lastElement } from "../util/Helpers.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererDifference extends Mixin(
    [ XmlRendererSerialization ],
    (base : ClassUnion<typeof XmlRendererSerialization>) =>

    class XmlRendererDifference extends base {
        prettyPrint     : boolean       = true


        createDynamicContext (element : XmlElement, parentContexts : XmlRenderingDynamicContextDifference[]) : XmlRenderingDynamicContextDifference {
            return XmlRenderingDynamicContextDifference.new({
                element,
                currentStream   : parentContexts.length > 0 ? lastElement(parentContexts).currentStream : undefined
            })
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class XmlRenderingDynamicContextDifference extends Mixin(
    [ XmlRenderingDynamicContext ],
    (base : ClassUnion<typeof XmlRenderingDynamicContext>) =>

    class XmlRenderingDynamicContextDifference extends base {
        currentStream       : 'left' | 'right' | 'middle'       = undefined
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameTriplex extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameTriplex extends base {
        left        : RenderingFrameSequence    = undefined
        middle      : RenderingFrameSequence    = undefined
        right       : RenderingFrameSequence    = undefined


        toTextBlock (output : TextBlock) {
            const leftBlock     = TextBlock.new()
            const rightBlock    = TextBlock.new()
            const middleBlock   = TextBlock.new()

            const blocks        = [ leftBlock, rightBlock, middleBlock ] as [ TextBlock, TextBlock, TextBlock ]

            this.left.toTextBlock(leftBlock)
            this.right.toTextBlock(rightBlock)
            this.middle.toTextBlock(middleBlock)

            blocks.forEach(block => block.equalizeLineLengthsMut())

            const lines         = Array.from(zip2(leftBlock.text, rightBlock.text))

            lines.forEach(([ leftStr, rightStr ], index) => {
                output.push(leftStr, ' │ │ ', rightStr)

                if (index !== lines.length - 1) output.addNewLine()
            })
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceTemplateElement extends XmlElement {
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateRoot extends DifferenceTemplateElement {
    tagName         : 'difference_template_root'           = 'difference_template_root'


    renderSelf (
        renderer            : XmlRendererDifference,
        sequence            : RenderingFrameSequence,
        parentContexts      : XmlRenderingDynamicContext[],
        ownContext          : XmlRenderingDynamicContextDifference,
    ) {
        const left          = RenderingFrameSequence.new()
        const right         = RenderingFrameSequence.new()
        const middle        = RenderingFrameSequence.new()

        super.renderSelf(renderer, left, parentContexts, XmlRenderingDynamicContextDifference.new({ element : this, currentStream : 'left' }))
        super.renderSelf(renderer, right, parentContexts, XmlRenderingDynamicContextDifference.new({ element : this, currentStream : 'right' }))
        super.renderSelf(renderer, middle, parentContexts, XmlRenderingDynamicContextDifference.new({ element : this, currentStream : 'middle' }))

        sequence.push(RenderingFrameTriplex.new({ left, right, middle }))
    }

}



//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArray extends Mixin(
    [ SerializationArray, DifferenceTemplateElement ],
    (base : ClassUnion<typeof SerializationArray, typeof DifferenceTemplateElement>) =>

    class DifferenceTemplateArray extends base {
        tagName         : string            = 'difference_template_array'
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArrayEntry extends DifferenceTemplateElement {
    props           : DifferenceTemplateElement[ 'props' ] & {
        index?       : number
    }

    tagName         : string                = 'difference_template_array_entry'

    index           : number
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateDifferent extends DifferenceTemplateElement {
    tagName         : 'difference_template_different'     = 'difference_template_different'

    childNodes      : [ Serialization, Serialization ]


    renderChildren (
        renderer            : XmlRendererDifference,
        sequence            : RenderingFrameSequence,
        parentContexts      : XmlRenderingDynamicContextDifference[],
        ownContext          : XmlRenderingDynamicContextDifference,
    ) {
        if (ownContext.currentStream === 'left')
            sequence.push(this.childNodes[ 0 ].render(renderer, [ ...parentContexts, ownContext ])[ 0 ])
        else if (ownContext.currentStream === 'right')
            sequence.push(this.childNodes[ 1 ].render(renderer, [ ...parentContexts, ownContext ])[ 0 ])
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateMissing extends DifferenceTemplateElement {
    props           : DifferenceTemplateElement[ 'props' ] & {
        from?            : '1' | '2'
    }

    tagName         : 'difference_template_missing'     = 'difference_template_missing'

    childNodes      : [ Serialization ]
}
