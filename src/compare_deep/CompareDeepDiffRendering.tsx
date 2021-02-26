import { ClassUnion, Mixin } from "../class/Mixin.js"
import { zip3 } from "../iterator/Iterator.js"
import { RenderingFrame, RenderingFrameSequence, RenderingFrameStartBlock, RenderingFrameSyncPoint } from "../jsx/RenderingFrame.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
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
// export const NoDiffAnnotationLines  = String.fromCharCode(0)


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

            const blocks        = [ leftBlock, middleBlock, rightBlock ]

            const iterators     = [
                this.left.toTextBlockGen(leftBlock),
                this.right.toTextBlockGen(rightBlock),
                this.middle.toTextBlockGen(middleBlock),
            ]

            while (true) {
                const { done : done0 }      = iterators[ 0 ].next()
                const { done : done1 }      = iterators[ 1 ].next()
                const { done : done2 }      = iterators[ 2 ].next()

                const allDone               = done0 && done1 && done2
                const someDone              = done0 || done1 || done2

                if (someDone && !allDone) throw new Error("Something is wrong")

                if (allDone) break

                const maxLines              = Math.max(...blocks.map(block => block.text.length))

                blocks.forEach(block => {
                    while (block.text.length < maxLines) block.addNewLine()
                })
            }

            [ leftBlock, rightBlock ].forEach(block => block.equalizeLineLengthsMut())
            middleBlock.equalizeLineLengthsMut(false)

            const lines         = Array.from(zip3(leftBlock.text, middleBlock.text, rightBlock.text))

            lines.forEach(([ leftStr, middleStr, rightStr ], index) => {
                output.push(
                    leftStr,
                    // ` │${ middleStr.toString().indexOf(NoDiffAnnotationLines) !== -1 ? ' '.repeat(middleStr.length) : middleStr }│ `,
                    ` │${ middleStr }│ `,
                    rightStr
                )

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
        parentContexts      : XmlRenderingDynamicContextDifference[],
        ownContext          : XmlRenderingDynamicContextDifference,
    ) {
        const left          = RenderingFrameSequence.new()
        const right         = RenderingFrameSequence.new()
        const middle        = RenderingFrameSequence.new()

        left.write('Received')
        // middle.write(NoDiffAnnotationLines)
        middle.write(' ')
        right.write('Expected');

        [ left, middle, right ].forEach(sequence => {
            sequence.push(RenderingFrameStartBlock.new(), RenderingFrameStartBlock.new(), RenderingFrameSyncPoint.new())
        })

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

        renderSelf (
            renderer            : XmlRendererDifference,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContextDifference[],
            ownContext          : XmlRenderingDynamicContextDifference,
        ) {
            if (ownContext.currentStream === 'middle') {
                sequence.write(' ')
                sequence.push(RenderingFrameStartBlock.new())
                super.renderChildren(renderer, sequence, parentContexts, ownContext)
                sequence.write(' ')
            } else
                super.renderSelf(renderer, sequence, parentContexts, ownContext)
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContextDifference[],
            ownContext          : XmlRenderingDynamicContextDifference,
        ) {
            if (ownContext.currentStream !== 'middle')
                super.beforeRenderChild(child, index, renderer, sequence, parentContexts, ownContext)
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContextDifference[],
            ownContext          : XmlRenderingDynamicContextDifference,
        ) {
            if (ownContext.currentStream !== 'middle')
                super.afterRenderChild(child, index, renderer, sequence, parentContexts, ownContext)

            sequence.push(RenderingFrameSyncPoint.new())
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArrayEntry extends DifferenceTemplateElement {
    props           : DifferenceTemplateElement[ 'props' ] & {
        index?       : number
    }

    tagName         : string                = 'difference_template_array_entry'

    renderSelf (
        renderer            : XmlRendererDifference,
        sequence            : RenderingFrameSequence,
        parentContexts      : XmlRenderingDynamicContextDifference[],
        ownContext          : XmlRenderingDynamicContextDifference,
    ) {
        if (ownContext.currentStream === 'middle')
            sequence.write(String(this.getAttribute('index')))
        else
            super.renderSelf(renderer, sequence, parentContexts, ownContext)
    }
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
