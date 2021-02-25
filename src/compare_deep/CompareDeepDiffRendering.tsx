import { ClassUnion, Mixin } from "../class/Mixin.js"
import { zip2 } from "../iterator/Iterator.js"
import {
    RenderingFrame,
    RenderingFrameContent,
    RenderingFrameIndent,
    RenderingFrameOutdent,
    RenderingFrameSequence,
    RenderingFrameStartBlock
} from "../jsx/RenderingFrame.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { Serialization, XmlRendererSerialization } from "../serializer/SerializerElements.js"
import { lastElement } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererDifference extends Mixin(
    [ XmlRendererSerialization ],
    (base : ClassUnion<typeof XmlRendererSerialization>) =>

    class XmlRendererDifference extends base {
        prettyPrint     : boolean       = true
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class XmlRenderingDynamicContextDifference extends Mixin(
    [ XmlRenderingDynamicContext ],
    (base : ClassUnion<typeof XmlRenderingDynamicContext>) =>

    class XmlRenderingDynamicContext extends base {
        left        : RenderingFrameSequence    = RenderingFrameSequence.new()
        middle      : RenderingFrameSequence    = RenderingFrameSequence.new()
        right       : RenderingFrameSequence    = RenderingFrameSequence.new()
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameTriplex extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameTriplex extends base {
        wrapped     : RenderingFrame            = undefined

        left        : RenderingFrameSequence    = RenderingFrameSequence.new()
        middle      : RenderingFrameSequence    = RenderingFrameSequence.new()
        right       : RenderingFrameSequence    = RenderingFrameSequence.new()


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
    createOwnDynamicContext (parentContexts : XmlRenderingDynamicContext[]) : XmlRenderingDynamicContextDifference {
        const parentContextWithTriplexRendering     = parentContexts.reduceRight<null | XmlRenderingDynamicContextDifference>(
            (acc : null | XmlRenderingDynamicContextDifference, context) =>
                acc || (context instanceof XmlRenderingDynamicContextDifference ? context : null),
            null
        )

        return parentContextWithTriplexRendering
            ?
                XmlRenderingDynamicContextDifference.new({
                    element     : this,
                    left        : parentContextWithTriplexRendering.left,
                    right       : parentContextWithTriplexRendering.right,
                    middle      : parentContextWithTriplexRendering.middle
                })
            :
                XmlRenderingDynamicContextDifference.new({ element : this })
    }
}

//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateDifference extends DifferenceTemplateElement {
    tagName         : 'difference_template_difference'           = 'difference_template_difference'


    render (renderer : XmlRenderer, dynamicContext : XmlRenderingDynamicContext[] = [])
        : [ RenderingFrame, ReturnType<this[ 'createOwnDynamicContext' ]> ]
    {
        const [ frame, context ] = super.render(renderer, dynamicContext)

        return [
            RenderingFrameTriplex.new({
                wrapped     : frame,
                left        : context.left,
                right       : context.right,
                middle      : context.middle
            }),
            context
        ]
    }
}



//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArray extends DifferenceTemplateElement {
    tagName         : 'difference_template_array'           = 'difference_template_array'


    renderSelf (renderer : XmlRendererDifference, sequence : RenderingFrameSequence, dynamicContexts : XmlRenderingDynamicContextDifference[]) {
        const dynamicContext        = lastElement(dynamicContexts)

        dynamicContext.left.write('[')
        dynamicContext.middle.write(' ')
        dynamicContext.right.write('[')

        renderer.prettyPrint && dynamicContext.left.push(RenderingFrameIndent.new())
        renderer.prettyPrint && dynamicContext.right.push(RenderingFrameIndent.new())

        super.renderSelf(renderer, sequence, dynamicContexts)

        renderer.prettyPrint && dynamicContext.left.push(RenderingFrameOutdent.new())
        renderer.prettyPrint && dynamicContext.right.push(RenderingFrameOutdent.new())

        dynamicContext.left.write(']')
        dynamicContext.middle.write(' ')
        dynamicContext.right.write(']')
    }


    // TODO need to re-use the `SerializationArray` method somehow
    renderChildren (renderer : XmlRendererDifference, sequence : RenderingFrameSequence, dynamicContexts : XmlRenderingDynamicContextDifference[]) {
        const dynamicContext        = lastElement(dynamicContexts)

        this.childNodes.forEach((child, index) => {
            if (index === 0)
                if (renderer.prettyPrint) {
                    dynamicContext.left.push(RenderingFrameStartBlock.new())
                    dynamicContext.right.push(RenderingFrameStartBlock.new())
                } else if (renderer.spaceAfterOpeningBracketArray) {
                    dynamicContext.left.write(' ')
                    dynamicContext.right.write(' ')
                }


            sequence.push(isString(child) ? RenderingFrameContent.new({ content : child }) : child.render(renderer, dynamicContexts)[ 0 ])

            if (index !== this.childNodes.length - 1) {
                dynamicContext.left.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
                dynamicContext.right.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
            } else {
                dynamicContext.left.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
                dynamicContext.right.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
            }
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArrayEntry extends DifferenceTemplateElement {
    props           : {
        index       : number
    }

    tagName         : 'difference_template_array_entry'     = 'difference_template_array_entry'

    index           : number


    renderSelf (renderer : XmlRendererDifference, sequence : RenderingFrameSequence, dynamicContexts : XmlRenderingDynamicContextDifference[]) {
        const dynamicContext        = lastElement(dynamicContexts)

        dynamicContext.middle.write(this.getAttribute('index'))

        super.renderSelf(renderer, sequence, dynamicContexts)
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
export class DifferenceTemplateDifferent extends DifferenceTemplateElement {
    tagName         : 'difference_template_different'     = 'difference_template_different'

    childNodes      : [ Serialization, Serialization ]

    props           : {
        childNodes?      : [ Serialization, Serialization ]
    }


    renderChildren (renderer : XmlRendererDifference, sequence : RenderingFrameSequence, dynamicContexts : XmlRenderingDynamicContextDifference[]) {
        const dynamicContext        = lastElement(dynamicContexts)

        dynamicContext.left.push(this.childNodes[ 0 ].render(renderer, dynamicContexts)[ 0 ])
        dynamicContext.right.push(this.childNodes[ 1 ].render(renderer, dynamicContexts)[ 0 ])
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateMissing extends DifferenceTemplateElement {
    props           : {
        from            : '1' | '2'
        childNodes      : [ Serialization ]
    }

    tagName         : 'difference_template_missing'     = 'difference_template_missing'

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
