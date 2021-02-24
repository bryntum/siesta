import { ClassUnion, Mixin } from "../class/Mixin.js"
import {
    RenderingFrameContent,
    RenderingFrameIndent,
    RenderingFrameOutdent,
    RenderingFrameSequence,
    RenderingFrameStartBlock
} from "../jsx/RenderingFrame.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { serializable } from "../serializable/Serializable.js"
import { Serialization, XmlRendererSerialization } from "../serializer/SerializerElements.js"
import { prototypeValue } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererDifference extends Mixin(
    [ XmlRendererSerialization ],
    (base : ClassUnion<typeof XmlRendererSerialization>) =>

    class XmlRendererDifference extends base {
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameTriplex extends Mixin(
    [ RenderingFrameSequence ],
    (base : ClassUnion<typeof RenderingFrameSequence>) =>

    class RenderingFrameTriplex extends base {
        left        : RenderingFrameSequence    = RenderingFrameSequence.new()
        middle      : RenderingFrameSequence    = RenderingFrameSequence.new()
        right       : RenderingFrameSequence    = RenderingFrameSequence.new()


        toTextBlock (output : TextBlock) {
            const leftBlock     = TextBlock.new()
            const rightBlock    = TextBlock.new()
            const middleBlock   = TextBlock.new()

            this.left.toTextBlock(leftBlock)
            this.right.toTextBlock(rightBlock)
            this.middle.toTextBlock(middleBlock)

            output.text.push(...leftBlock.text, ...middleBlock.text, ...rightBlock.text)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArray extends XmlElement {
    props           : {
    }

    tagName         : 'difference_template_array'           = 'difference_template_array'

    @prototypeValue(RenderingFrameTriplex)
    renderingSequenceClass  : typeof RenderingFrameTriplex


    renderSelf (renderer : XmlRendererDifference, sequence : RenderingFrameTriplex) {
        debugger

        sequence.left.write('[')
        sequence.right.write('[')

        renderer.prettyPrint && sequence.left.push(RenderingFrameIndent.new())
        renderer.prettyPrint && sequence.right.push(RenderingFrameIndent.new())

        super.renderSelf(renderer, sequence)

        renderer.prettyPrint && sequence.push(RenderingFrameOutdent.new())

        sequence.write(']')
    }


    renderChildren (renderer : XmlRendererSerialization, sequence : RenderingFrameTriplex) {
        this.childNodes.forEach((child, index) => {
            if (index === 0)
                if (renderer.prettyPrint)
                    sequence.push(RenderingFrameStartBlock.new())
                else if (renderer.spaceAfterOpeningBracketArray)
                    sequence.write(' ')


            sequence.push(isString(child) ? RenderingFrameContent.new({ content : child }) : child.render(renderer))

            if (index !== this.childNodes.length - 1)
                sequence.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
            else
                sequence.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArrayEntry extends XmlElement {
    props           : {
        index       : number
    }

    tagName         : 'difference_template_array_entry'     = 'difference_template_array_entry'

    index           : number

    @prototypeValue(RenderingFrameTriplex)
    renderingSequenceClass  : typeof RenderingFrameTriplex


    renderSelf (renderer : XmlRendererDifference, sequence : RenderingFrameTriplex) {
        sequence.middle.write(this.getAttribute('index'))

        super.renderSelf(renderer, sequence)
    }


    // renderChildren (renderer : XmlRendererSerialization, sequence : RenderingFrameTriplex) {
    //     this.childNodes.forEach((child, index) => {
    //         if (index === 0)
    //             if (renderer.prettyPrint)
    //                 sequence.push(RenderingFrameStartBlock.new())
    //             else if (renderer.spaceAfterOpeningBracketArray)
    //                 sequence.write(' ')
    //
    //
    //         sequence.push(isString(child) ? RenderingFrameContent.new({ content : child }) : child.render(renderer))
    //
    //         if (index !== this.childNodes.length - 1)
    //             sequence.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
    //         else
    //             sequence.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
    //     })
    // }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateDifferent extends XmlElement {
    tagName         : 'difference_template_different'     = 'difference_template_different'

    childNodes      : [ Serialization, Serialization ]

    props           : {
        childNodes?      : [ Serialization, Serialization ]
    }


    @prototypeValue(RenderingFrameTriplex)
    renderingSequenceClass  : typeof RenderingFrameTriplex


    renderSelf (renderer : XmlRendererDifference, sequence : RenderingFrameTriplex) {
        this.childNodes[ 0 ].renderSelf(renderer, sequence.left)
        this.childNodes[ 1 ].renderSelf(renderer, sequence.right)
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateMissing extends XmlElement {
    props           : {
        from            : '1' | '2'
        childNodes      : [ Serialization ]
    }

    tagName         : 'difference_template_missing'     = 'difference_template_missing'

    @prototypeValue(RenderingFrameTriplex)
    renderingSequenceClass  : typeof RenderingFrameTriplex

    childNodes      : [ Serialization ]

    from            : '1' | '2'


    // renderSelf (renderer : XmlRendererSerialization, sequence : RenderingFrameSequence) {
    //     this.checkForReferenceId(renderer, sequence)
    //
    //     sequence.write('[')
    //
    //     renderer.prettyPrint && sequence.push(RenderingFrameIndent.new())
    //
    //     super.renderSelf(renderer, sequence)
    //
    //     renderer.prettyPrint && sequence.push(RenderingFrameOutdent.new())
    //
    //     sequence.write(']')
    // }
    //
    //
    // renderChildren (renderer : XmlRendererSerialization, sequence : RenderingFrameSequence) {
    //     this.childNodes.forEach((child, index) => {
    //         if (index === 0)
    //             if (renderer.prettyPrint)
    //                 sequence.push(RenderingFrameStartBlock.new())
    //             else if (renderer.spaceAfterOpeningBracketArray)
    //                 sequence.write(' ')
    //
    //
    //         sequence.push(isString(child) ? RenderingFrameContent.new({ content : child }) : child.render(renderer))
    //
    //         if (index !== this.childNodes.length - 1)
    //             sequence.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
    //         else
    //             sequence.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
    //     })
    // }
}
