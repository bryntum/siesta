import { ClassUnion, Mixin } from "../class/Mixin.js"
import { zip3 } from "../iterator/Iterator.js"
import { ColoredStringResumeSyncPoints, ColoredStringSuppressSyncPoints, ColoredStringSyncPoint, RenderingProgress } from "../jsx/ColoredString.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import {
    Serialization,
    SerializationArray, SerializationComposite, SerializationMap, SerializationMapEntry,
    SerializationObject,
    SerializationObjectEntry, SerializationReferenceable,
    SerializationSet,
    XmlRendererSerialization
} from "../serializer/SerializerRendering.js"
import { isString } from "../util/Typeguards.js"
import { DifferenceType } from "./CompareDeepDiff.js"


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
// this class renders the children directly to its own output textblock
// regular styling/indentation/etc does not apply
export class DifferenceTemplateElement extends XmlElement {
    props           : XmlElement[ 'props' ] & {
        type?           : DifferenceType
    }

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
export class DifferenceTemplateReferenceable extends Mixin(
    [ SerializationReferenceable, DifferenceTemplateElement ],
    (base : ClassUnion<typeof SerializationReferenceable, typeof DifferenceTemplateElement>) =>

    class DifferenceTemplateReferenceable extends base {
        props   : SerializationReferenceable[ 'props' ] & DifferenceTemplateElement[ 'props' ] & {
            refId2?          : number
        }


        getRefId (context : XmlRenderingDynamicContextDifference) : number {
            return context.currentStream === 'left' ? this.getAttribute('refId') : this.getAttribute('refId2')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceTemplateComposite extends Mixin(
    [ SerializationComposite, DifferenceTemplateReferenceable ],
    (base : ClassUnion<typeof SerializationComposite, typeof DifferenceTemplateReferenceable>) =>

    class DifferenceTemplateComposite extends base {

        renderSelf (
            renderer        : XmlRendererDifference,
            output          : TextBlock,
            context         : XmlRenderingDynamicContextDifference
        ) {
            if (
                context.currentStream === 'left' && this.getAttribute('type') === 'onlyIn2'
                ||
                context.currentStream === 'right' && this.getAttribute('type') === 'onlyIn1'
            ) {
                output.write('░')

                // this.beforeRenderChildren(renderer, output, context)
                // this.renderChildren(renderer, output, context)
                // this.afterRenderChildren(renderer, output, context)

                // output.push(ColoredStringSyncPoint.new({ el : this }))
            }
            else
                super.renderSelf(renderer, output, context)

            // output.push(ColoredStringSyncPoint.new({ el : this }))
        }


        beforeRenderChildren (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.beforeRenderChildren(renderer, output, context)
            else {
                this.beforeRenderChildrenMiddle(renderer, output, context)
            }
        }


        beforeRenderChildrenMiddle (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
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
export class DifferenceTemplateReference extends DifferenceTemplateElement {
    props   : DifferenceTemplateElement[ 'props' ] & {
        refId1?          : number
        refId2?          : number
    }


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'left') {
            if (this.getAttribute('type') === 'onlyIn2')
                output.write('░')
            else
                output.write(`[Circular *${ this.getAttribute('refId1') }]`)
        } else if (context.currentStream === 'right') {
            if (this.getAttribute('type') === 'onlyIn1')
                output.write('░')
            else
                output.write(`[Circular *${ this.getAttribute('refId2') }]`)
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateHeterogeneous extends DifferenceTemplateElement {
    tagName         : 'difference_template_heterogeneous'           = 'difference_template_heterogeneous'


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'left') {
            if (this.getAttribute('type') === 'onlyIn2')
                output.write('░')
            else {
                output.push(ColoredStringSuppressSyncPoints.new())

                this.renderChildInner(this.childNodes[ 0 ], 0, renderer, output, context)

                output.push(ColoredStringResumeSyncPoints.new())
            }
        } else if (context.currentStream === 'right') {
            if (this.getAttribute('type') === 'onlyIn1')
                output.write('░')
            else {
                output.push(ColoredStringSuppressSyncPoints.new())

                this.renderChildInner(this.childNodes[ 1 ], 1, renderer, output, context)

                output.push(ColoredStringResumeSyncPoints.new())
            }
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
        // ensure at least one space width for central region
        middle.write(' ')
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

        const advanceIterator = (iterator : Generator<RenderingProgress, any, unknown>) : number => {
            let syncPointsSuppressed        = false

            do {
                const iteration             = iterator.next()

                if (iteration.done === true) return Number.MAX_SAFE_INTEGER

                const command               = iteration.value

                if (!syncPointsSuppressed && (command instanceof ColoredStringSyncPoint)) {
                    return command.el.depth
                } else if (command instanceof ColoredStringSuppressSyncPoints) {
                    syncPointsSuppressed    = true
                }
                else if (command instanceof ColoredStringResumeSyncPoints) {
                    syncPointsSuppressed    = false
                }
            } while (true)
        }

        const depths        = iterators.map(advanceIterator)

        while (true) {
            const maxLines              = Math.max(...blocks.map(block => block.text.length))

            blocks.forEach(block => {
                while (block.text.length < maxLines) block.addNewLine()
            })

            let minDepth                = Math.min(...depths)

            if (minDepth === Number.MAX_SAFE_INTEGER) break

            if (depths.every(depth => depth === minDepth || depth === Number.MAX_SAFE_INTEGER)) minDepth = Number.MIN_SAFE_INTEGER

            for (let i = 0; i < iterators.length; i++) {
                if (depths[ i ] > minDepth && depths[ i ] !== Number.MAX_SAFE_INTEGER) depths[ i ] = advanceIterator(iterators[ i ])
            }
        }

        [ leftBlock, rightBlock ].forEach(block => block.equalizeLineLengthsMut())
        middleBlock.equalizeLineLengthsMut(false)

        const lines         = Array.from(zip3(leftBlock.text, middleBlock.text, rightBlock.text))

        lines.forEach(([ leftStr, middleStr, rightStr ], index) => {
            output.push(leftStr, ` │${ middleStr }│ `, rightStr)

            if (index !== lines.length - 1) output.addNewLine()
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateArray extends Mixin(
    [ SerializationArray, DifferenceTemplateComposite ],
    (base : ClassUnion<typeof SerializationArray, typeof DifferenceTemplateComposite>) =>

    class DifferenceTemplateArray extends base {
        props           : SerializationArray[ 'props' ] & DifferenceTemplateComposite[ 'props' ] & {
            length2       : number
        }

        tagName         : string            = 'difference_template_array'


        beforeRenderChildrenMiddle (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            const length1   = this.getAttribute('length')
            const length2   = this.getAttribute('length2')

            if (length1 > 0 || length2 > 0) output.write('\n')
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
        if (context.currentStream === 'middle') {
            output.write(String(this.getAttribute('index')))

            this.renderChildren(renderer, output, context)
        } else
            super.renderSelf(renderer, output, context)
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateAtomic extends DifferenceTemplateElement {
    tagName         : string            = 'difference_template_value'

    childNodes      : [ Serialization | MissingValue, Serialization | MissingValue ]


    renderChildren (
        renderer    : XmlRendererDifference,
        output      : TextBlock,
        context     : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'left') {
            if (this.getAttribute('type') === 'onlyIn2')
                output.write('░')
            else
                this.renderChildInner(this.childNodes[ 0 ], 0, renderer, output, context)
        } else if (context.currentStream === 'right') {
            if (this.getAttribute('type') === 'onlyIn1')
                output.write('░')
            else
                this.renderChildInner(this.childNodes[ 1 ], 0, renderer, output, context)
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateObject extends Mixin(
    [ SerializationObject, DifferenceTemplateComposite ],
    (base : ClassUnion<typeof SerializationObject, typeof DifferenceTemplateComposite>) =>

    class DifferenceTemplateObject extends base {
        tagName         : string            = 'difference_template_object'

        props           : SerializationObject[ 'props' ] & DifferenceTemplateComposite[ 'props' ] & {
            constructorName2?       : string
        }


        getConstructorName (
            renderer    : XmlRendererDifference,
            context     : XmlRenderingDynamicContextDifference
        ) {
            return context.currentStream === 'left' ? this.getAttribute('constructorName') : this.getAttribute('constructorName2')
        }


        needCommaAfterChild (
            child               : DifferenceTemplateObjectEntry,
            index               : number,
            renderer            : XmlRendererDifference,
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


        nextChildEntryHasMissingIn (index : number, stream : 'left' | 'right') : boolean {
            if (index + 1 > this.childNodes.length - 1) return false

            const entryEl       = this.childNodes[ index + 1 ] as DifferenceTemplateObjectEntry
            const keyEl         = entryEl.childNodes[ 0 ] as DifferenceTemplateAtomic

            // return stream === 'left' ? keyEl.getAttribute('type') === 'onlyIn2' : keyEl.getAttribute('type') === 'onlyIn1'

            return keyEl.childNodes[ stream === 'left' ? 0 : 1 ].tagName.toLowerCase() === 'missing_value'
        }


        childEntryHasMissingIn (child : DifferenceTemplateObjectEntry, stream : 'left' | 'right') : boolean {
            const keyEl     = child.childNodes[ 0 ] as DifferenceTemplateAtomic

            // return stream === 'left' ? keyEl.getAttribute('type') === 'onlyIn2' : keyEl.getAttribute('type') === 'onlyIn1'

            return keyEl.childNodes[ stream === 'left' ? 0 : 1 ].tagName.toLowerCase() === 'missing_value'
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateObjectEntry extends SerializationObjectEntry {
    props           : DifferenceTemplateElement[ 'props' ]

    tagName         : string                = 'difference_template_object_entry'


    // renderSelf (
    //     renderer        : XmlRendererDifference,
    //     output          : TextBlock,
    //     context         : XmlRenderingDynamicContextDifference
    // ) {
    //     if (context.currentStream === 'left') {
    //         if (this.getAttribute('type') === 'onlyIn2')
    //             output.write('░')
    //         else
    //             super.renderSelf(renderer, output, context)
    //     }
    //     else if (context.currentStream === 'right') {
    //         if (this.getAttribute('type') === 'onlyIn1')
    //             output.write('░')
    //         else
    //             super.renderSelf(renderer, output, context)
    //     }
    //     else {
    //         this.renderChildren(renderer, output, context)
    //     }
    // }


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'middle') {
            this.renderChildren(renderer, output, context)
        } else {
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


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateSet extends Mixin(
    [ SerializationSet, DifferenceTemplateComposite ],
    (base : ClassUnion<typeof SerializationSet, typeof DifferenceTemplateComposite>) =>

    class DifferenceTemplateSet extends base {
        props           : SerializationSet[ 'props' ] & DifferenceTemplateComposite[ 'props' ] & {
            size2?          : number
        }

        tagName         : string            = 'difference_template_set'

        childNodes      : DifferenceTemplateElement[]


        getSize (context : XmlRenderingDynamicContextDifference) : number {
            return context.currentStream === 'left' ? this.getAttribute('size') : this.getAttribute('size2')
        }


        beforeRenderChildrenMiddle (
            renderer    : XmlRendererDifference,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            const size1   = this.getAttribute('size')
            const size2   = this.getAttribute('size2')

            if (size1 > 0 || size2 > 0) output.write('\n')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateSetEntry extends DifferenceTemplateElement {
    tagName         : string                = 'difference_template_set_entry'


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'middle') {
            output.write(' ')

            this.renderChildren(renderer, output, context)
        } else {
            super.renderSelf(renderer, output, context)
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateMap extends Mixin(
    [ SerializationMap, DifferenceTemplateComposite ],
    (base : ClassUnion<typeof SerializationMap, typeof DifferenceTemplateComposite>) =>

    class DifferenceTemplateMap extends base {
        props           : SerializationMap[ 'props' ] & DifferenceTemplateComposite[ 'props' ] & {
            size2?          : number
        }

        tagName         : string            = 'difference_template_map'

        childNodes      : DifferenceTemplateMapEntry[]


        getSize (context : XmlRenderingDynamicContextDifference) : number {
            return context.currentStream === 'left' ? this.getAttribute('size') : this.getAttribute('size2')
        }


        beforeRenderChildrenMiddle (
            renderer    : XmlRendererDifference,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            const size1   = this.getAttribute('size')
            const size2   = this.getAttribute('size2')

            if (size1 > 0 || size2 > 0) output.write('\n')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateMapEntry extends SerializationMapEntry {
    props           : SerializationMap[ 'props' ] & DifferenceTemplateElement[ 'props' ]

    tagName         : string                = 'difference_template_map_entry'


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'middle') {
            output.write(' ')

            this.renderChildren(renderer, output, context)
        } else {
            // TODO REMOVE
            if (
                this.getAttribute('type') === 'onlyIn2' && context.currentStream === 'left'
                ||
                this.getAttribute('type') === 'onlyIn1' && context.currentStream === 'right'
            ) {
                output.write('░')
            }
            else
            // eof TODO REMOVE
                super.renderSelf(renderer, output, context)
        }
    }


    valueIsAtomic (renderer : XmlRendererDifference, context : XmlRenderingDynamicContextDifference) : boolean {
        const childIndex        = context.currentStream === 'left' ? 0 : 1

        const valueDiffEl       = this.childNodes[ childIndex ] as XmlElement

        if (valueDiffEl.tagName.toLowerCase() === 'difference_template_value') {
            const serializedNode    = (valueDiffEl as DifferenceTemplateAtomic).childNodes[ childIndex ] as XmlElement

            if (serializedNode instanceof MissingValue) {
                throw new Error("Should not happen")
            } else
                // return serializedNode.valueIsAtomic(renderer, context)
                return renderer.atomicElementNodes.has(serializedNode.tagName.toLowerCase())
        } else {
            return false
        }
    }
}
