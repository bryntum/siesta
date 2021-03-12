import { ClassUnion, Mixin } from "../class/Mixin.js"
import { zip3 } from "../iterator/Iterator.js"
import { ColoredStringSyncPoint } from "../jsx/ColoredString.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import {
    Serialization,
    SerializationArray,
    SerializationObject,
    SerializationObjectEntry,
    XmlRendererSerialization
} from "../serializer/SerializerRendering.js"
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
export class MissingValue extends XmlElement {
    tagName             : 'missing_value'           = 'missing_value'
}


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
        right.write('Expected');

        [ left, middle, right ].forEach(output => output.push('\n\n', ColoredStringSyncPoint.new({ el : this })))

        const shadowContext = currentStream => XmlRenderingDynamicContextDifference.new({ parentContext : context.parentContext, element : this, currentStream })

        super.renderSelf(renderer, left, shadowContext('left'))
        super.renderSelf(renderer, right, shadowContext('right'))
        super.renderSelf(renderer, middle, shadowContext('middle'))

        this.combineDiffStreams(output, left, right, middle)
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

        const advanceIterator = (iterator : Generator<ColoredStringSyncPoint, any, unknown>) : number => {
            const iteration     = iterator.next()

            if (iteration.done === true)
                return Number.MAX_SAFE_INTEGER
            else
                return iteration.value.el.depth
        }

        const depths        = iterators.map(advanceIterator)

        while (true) {
            const maxLines              = Math.max(...blocks.map(block => block.text.length))

            blocks.forEach(block => {
                while (block.text.length < maxLines) block.addNewLine()
            })

            let minDepth                = Math.min(...depths)

            if (minDepth === Number.MAX_SAFE_INTEGER) break

            if (depths.every(depth => depth === minDepth)) minDepth = Number.MIN_SAFE_INTEGER

            for (let i = 0; i < iterators.length; i++) {
                if (depths[ i ] > minDepth) depths[ i ] = advanceIterator(iterators[ i ])
            }
        }

        [ leftBlock, rightBlock ].forEach(block => block.equalizeLineLengthsMut())
        middleBlock.equalizeLineLengthsMut(false)

        const lines         = Array.from(zip3(leftBlock.text, middleBlock.text, rightBlock.text))

        lines.forEach(([ leftStr, middleStr, rightStr ], index) => {
            output.push(
                leftStr,
                ` │${ middleStr }│ `,
                rightStr
            )

            if (index !== lines.length - 1) output.addNewLine()
        })
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

            output.push(ColoredStringSyncPoint.new({ el : this }))
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

            output.push(ColoredStringSyncPoint.new({ el : child as XmlElement }))
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
export class DifferenceTemplateValue extends DifferenceTemplateElement {
    tagName         : string            = 'difference_template_value'

    childNodes      : [ Serialization | MissingValue, Serialization | MissingValue ]


    renderChildren (
        renderer    : XmlRendererDifference,
        output      : TextBlock,
        context     : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'left') {
            if (this.childNodes[ 0 ].tagName.toLowerCase() === 'missing_value')
                output.write('░')
            else
                this.renderChildInner(this.childNodes[ 0 ].childNodes[ 0 ], 0, renderer, output, context)
        } else if (context.currentStream === 'right') {
            if (this.childNodes[ 1 ].tagName.toLowerCase() === 'missing_value')
                output.write('░')
            else
                this.renderChildInner(this.childNodes[ 1 ].childNodes[ 0 ], 0, renderer, output, context)
        }
    }
}


// //---------------------------------------------------------------------------------------------------------------------
// @serializable()
// export class DifferenceTemplateDifferent extends DifferenceTemplateElement {
//     tagName         : string            = 'difference_template_different'
//
//     childNodes      : [ Serialization, Serialization ]
//
//
//     renderChildren (
//         renderer    : XmlRendererDifference,
//         output      : TextBlock,
//         context     : XmlRenderingDynamicContextDifference
//     ) {
//         if (context.currentStream === 'left')
//             this.renderChildInner(this.childNodes[ 0 ].childNodes[ 0 ], 0, renderer, output, context)
//         else if (context.currentStream === 'right')
//             this.renderChildInner(this.childNodes[ 1 ].childNodes[ 0 ], 0, renderer, output, context)
//     }
// }
//
//
// //---------------------------------------------------------------------------------------------------------------------
// @serializable()
// export class DifferenceTemplateSame extends DifferenceTemplateDifferent {
//     tagName         : string            = 'difference_template_same'
// }
//
//
//
// //---------------------------------------------------------------------------------------------------------------------
// @serializable()
// export class DifferenceTemplateMissing extends DifferenceTemplateElement {
//     props           : DifferenceTemplateElement[ 'props' ] & {
//         presentIn?          : '1' | '2'
//     }
//
//     tagName         : string        = 'difference_template_missing'
//
//     childNodes      : [ Serialization ]
//
//
//     renderChildren (
//         renderer    : XmlRendererDifference,
//         output      : TextBlock,
//         context     : XmlRenderingDynamicContextDifference
//     ) {
//         const presentIn     = this.getAttribute('presentIn')
//
//         if (context.currentStream === 'left') {
//             if (presentIn === '1')
//                 this.renderChildInner(this.childNodes[ 0 ].childNodes[ 0 ], 0, renderer, output, context)
//             else
//                 output.write('░')
//         }
//         else if (context.currentStream === 'right') {
//             if (presentIn === '2')
//                 this.renderChildInner(this.childNodes[ 0 ].childNodes[ 0 ], 0, renderer, output, context)
//             else
//                 output.write('░')
//         }
//     }
// }


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateObject extends Mixin(
    [ SerializationObject, DifferenceTemplateElement ],
    (base : ClassUnion<typeof SerializationObject, typeof DifferenceTemplateElement>) =>

    class DifferenceTemplateObject extends base {
        tagName         : string            = 'difference_template_object'


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


        needCommaAfterChild (
            child               : DifferenceTemplateObjectEntry,
            index               : number,
            renderer            : XmlRendererSerialization,
            context             : XmlRenderingDynamicContextDifference
        )
            : boolean
        {
            const stream        = context.currentStream === 'left' ? 'left' : 'right'

            if (
                this.childEntryHasMissingIn(child, stream)
                ||
                stream === 'left' && this.nextChildEntryHasMissingIn(index, stream)
            ) {
                return false
            } else {
                return super.needCommaAfterChild(child, index, renderer, context)
            }
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

            output.push(ColoredStringSyncPoint.new({ el : child as XmlElement }))
        }


        nextChildEntryHasMissingIn (index : number, stream : 'left' | 'right') : boolean {
            if (index + 1 > this.childNodes.length - 1) return false

            const entryEl       = this.childNodes[ index + 1 ] as DifferenceTemplateObjectEntry
            const keyEl         = entryEl.childNodes[ 0 ] as DifferenceTemplateValue

            return keyEl.childNodes[ stream === 'left' ? 0 : 1 ].tagName.toLowerCase() === 'missing_value'
        }


        childEntryHasMissingIn (child : DifferenceTemplateObjectEntry, stream : 'left' | 'right') : boolean {
            const keyEl     = child.childNodes[ 0 ] as DifferenceTemplateValue

            return keyEl.childNodes[ stream === 'left' ? 0 : 1 ].tagName.toLowerCase() === 'missing_value'
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateObjectEntry extends SerializationObjectEntry {
    props           : DifferenceTemplateElement[ 'props' ] & {
        type?       : 'common' | 'onlyIn1' | 'onlyIn2'
    }

    tagName         : string                = 'difference_template_object_entry'


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'middle')
            output.write(' ')
        else {
            const keyEl     = this.childNodes[ 0 ]

            if (
                (keyEl.childNodes[ 0 ] as XmlElement).tagName.toLowerCase() === 'missing_value'
                && context.currentStream === 'left'
                ||
                (keyEl.childNodes[ 1 ] as XmlElement).tagName.toLowerCase() === 'missing_value'
                && context.currentStream === 'right'
            ) {
                output.write('░')
            }
            else
                super.renderSelf(renderer, output, context)
        }
    }
}
