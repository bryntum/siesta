import { ClassUnion, Mixin } from "../class/Mixin.js"
import { zip3 } from "../iterator/Iterator.js"
import { ColoredStringSyncPoint } from "../jsx/ColoredString.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { Serialization, SerializationArray, XmlRendererSerialization } from "../serializer/SerializerRendering.js"
import { isString } from "../util/Typeguards.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererDifference extends Mixin(
    [ XmlRendererSerialization ],
    (base : ClassUnion<typeof XmlRendererSerialization>) =>

    class XmlRendererDifference extends base {
        prettyPrint     : boolean       = true


        createDynamicContext (element : XmlElement, parentContext : XmlRenderingDynamicContextDifference) : XmlRenderingDynamicContextDifference {
            return XmlRenderingDynamicContextDifference.new({
                parentContext,
                element,
                currentStream   : parentContext ? parentContext.currentStream : undefined
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


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceTemplateElement extends XmlElement {
    renderChildInner (
        child               : XmlNode,
        index               : number,
        renderer            : XmlRenderer,
        output              : TextBlock,
        context             : XmlRenderingDynamicContext
    ) {
        if (isString(child)) {
            output.push(child)
        } else {
            child.renderToTextBlock(renderer, output, context)
        }
    }


    combineDiffStreams (output : TextBlock, leftSource : TextBlock, rightSource : TextBlock, middleSource : TextBlock) {
        const leftBlock     = TextBlock.new()
        const rightBlock    = TextBlock.new()
        const middleBlock   = TextBlock.new()

        const blocks        = [ leftBlock, middleBlock, rightBlock ]

        const iterators     = [
            leftSource.copySynced(leftBlock),
            rightSource.copySynced(rightBlock),
            middleSource.copySynced(middleBlock),
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


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateRoot extends DifferenceTemplateElement {
    tagName         : 'difference_template_root'           = 'difference_template_root'


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        const left          = TextBlock.new()
        const right         = TextBlock.new()
        const middle        = TextBlock.new()

        left.write('Received')
        // middle.write(NoDiffAnnotationLines)
        middle.write(' ')
        right.write('Expected');

        [ left, middle, right ].forEach(output => output.push('\n\n', ColoredStringSyncPoint.new()))

        const shadowContext = currentStream => XmlRenderingDynamicContextDifference.new({ parentContext : context.parentContext, element : this, currentStream })

        super.renderSelf(renderer, left, shadowContext('left'))
        super.renderSelf(renderer, right, shadowContext('right'))
        super.renderSelf(renderer, middle, shadowContext('middle'))

        this.combineDiffStreams(output, left, right, middle)
    }

}



//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArray extends Mixin(
    [ SerializationArray, DifferenceTemplateElement ],
    (base : ClassUnion<typeof SerializationArray, typeof DifferenceTemplateElement>) =>

    class DifferenceTemplateArray extends base {
        tagName         : string            = 'difference_template_array'


        beforeRenderChildren (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.beforeRenderChildren(renderer, output, context)
            else {
                output.write('\n')
            }
        }


        afterRenderChildren (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.afterRenderChildren(renderer, output, context)
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.beforeRenderChild(child, index, renderer, output, context)
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.afterRenderChild(child, index, renderer, output, context)

            output.push(ColoredStringSyncPoint.new())
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
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'middle')
            output.write(String(this.getAttribute('index')))
        else
            super.renderSelf(renderer, output, context)
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateDifferent extends DifferenceTemplateElement {
    tagName         : 'difference_template_different'     = 'difference_template_different'

    childNodes      : [ Serialization, Serialization ]


    renderChildren (
        renderer    : XmlRendererDifference,
        output      : TextBlock,
        context     : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'left')
            this.renderChildInner(this.childNodes[ 0 ].childNodes[ 0 ], 0, renderer, output, context)
        else if (context.currentStream === 'right')
            this.renderChildInner(this.childNodes[ 1 ].childNodes[ 0 ], 0, renderer, output, context)
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
