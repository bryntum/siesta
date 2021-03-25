import { ClassUnion, Mixin } from "../class/Mixin.js"
import { CI, zip3 } from "../iterator/Iterator.js"
import {
    ColoredStringPlain,
    ColoredStringResumeSyncPoints,
    ColoredStringSuppressSyncPoints,
    ColoredStringSyncPoint,
    RenderingProgress
} from "../jsx/ColoredString.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import {
    Serialization,
    SerializationArray,
    SerializationComposite,
    SerializationMap,
    SerializationMapEntry,
    SerializationObject,
    SerializationObjectEntry,
    SerializationReferenceable,
    SerializationSet,
    XmlRendererSerialization
} from "../serializer/SerializerRendering.js"
import { styles } from "../siesta/reporter/styling/terminal.js"
import { isString } from "../util/Typeguards.js"
import { DifferenceType } from "./CompareDeepDiff.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererDifference extends Mixin(
    [ XmlRendererSerialization ],
    (base : ClassUnion<typeof XmlRendererSerialization>) =>

    class XmlRendererDifference extends base {
        // always true for diff renderer
        prettyPrint     : true          = true


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
        same?           : boolean
    }


    colorizeSelf (renderer : XmlRendererDifference, output : TextBlock, context : XmlRenderingDynamicContextDifference) {
        super.colorizeSelf(renderer, output, context)

        if (context.currentStream === 'middle') {
            output.colorizeMut(this.getAttribute('same') ? styles.get('gray')(renderer.c) : renderer.c.reset)
        }
        else if (CI(this.parentAxis()).some(el => el instanceof DifferenceTemplateHeterogeneous)) {
            output.colorizeMut(styles.get('accented')(renderer.c))
        }
        else if (this.getAttribute('same')) {
            output.colorizeMut(styles.get('gray')(renderer.c))
        }
        else if (this.getAttribute('type') === 'onlyIn1') {
            output.colorizeMut(styles.get('fail_color')(renderer.c))
        }
        else if (this.getAttribute('type') === 'onlyIn2') {
            output.colorizeMut(styles.get('pass_color')(renderer.c))
        }
        else if (this.getAttribute('same') === false) {
            output.colorizeMut(styles.get('accented')(renderer.c))
        }
    }


    isMissingIn (stream : 'left' | 'right') : boolean {
        const type      = this.getAttribute('type')

        return stream === 'left' && type === 'onlyIn2' || stream === 'right' && type === 'onlyIn1'
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
@serializable()
export class DifferenceTemplateStreamed extends DifferenceTemplateElement {

    renderSelfLeft (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
    }


    renderSelfRight (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
    }


    renderSelfMiddle (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
    }


    renderSelf (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        if (context.currentStream === 'left') {
            if (this.getAttribute('type') === 'onlyIn2')
                output.write(ColoredStringPlain.new({ string : '░', c : renderer.c.gray }))
            else
                this.renderSelfLeft(renderer, output, context)
        } else if (context.currentStream === 'right') {
            if (this.getAttribute('type') === 'onlyIn1')
                output.write(ColoredStringPlain.new({ string : '░', c : renderer.c.gray }))
            else
                this.renderSelfRight(renderer, output, context)
        } else {
            this.renderSelfMiddle(renderer, output, context)
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DifferenceTemplateComposite extends Mixin(
    [ SerializationComposite, DifferenceTemplateReferenceable ],
    (base : ClassUnion<typeof SerializationComposite, typeof DifferenceTemplateReferenceable>) =>

    class DifferenceTemplateComposite extends base {

        childNodes          : DifferenceTemplateElement[]


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
                output.write(ColoredStringPlain.new({ string : '░', c : renderer.c.gray }))
            }
            else
                super.renderSelf(renderer, output, context)
        }


        beforeRenderChildren (
            renderer    : XmlRendererDifference,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.beforeRenderChildren(renderer, output, context)
        }


        afterRenderChildren (
            renderer    : XmlRendererDifference,
            output      : TextBlock,
            context     : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.afterRenderChildren(renderer, output, context)

            if (this.childNodes.length > 0) output.push(ColoredStringSyncPoint.new({ el : this }))
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererDifference,
            output              : TextBlock,
            context             : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.beforeRenderChild(child, index, renderer, output, context)
            else
                if (index === 0) output.write('\n')
        }


        renderChild (
            child               : string | DifferenceTemplateElement,
            index               : number,
            renderer            : XmlRendererDifference,
            output              : TextBlock,
            context             : XmlRenderingDynamicContextDifference
        ) {
            if (isString(child)) {
                super.renderChild(child, index, renderer, output, context)
            }
            else if (
                child.getAttribute('type') === 'onlyIn2' && context.currentStream === 'left'
                ||
                child.getAttribute('type') === 'onlyIn1' && context.currentStream === 'right'
            ) {
                output.write(ColoredStringPlain.new({ string : '░', c : renderer.c.gray }))
            }
            else {
                super.renderChild(child, index, renderer, output, context)
            }
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererDifference,
            output              : TextBlock,
            context             : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream !== 'middle')
                super.afterRenderChild(child, index, renderer, output, context)
            else
                output.write('\n')

            output.push(ColoredStringSyncPoint.new({ el : child as XmlElement }))
        }


        getOnlyIn2Size () : number {
            throw new Error('Abstract method')
        }


        needCommaAfterChild (
            child               : DifferenceTemplateElement,
            index               : number,
            renderer            : XmlRendererDifference,
            context             : XmlRenderingDynamicContextDifference
        )
            : boolean
        {
            const stream        = context.currentStream === 'left' ? 'left' : 'right'
            const nextChild     = this.childNodes[ index + 1 ]

            if (
                child.isMissingIn(stream)
                ||
                nextChild === undefined
                ||
                stream === 'left' && nextChild.isMissingIn(stream)
                ||
                stream === 'right' && nextChild.isMissingIn(stream) && this.getOnlyIn2Size() === 0
            ) {
                return false
            } else {
                return super.needCommaAfterChild(child, index, renderer, context)
            }
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateAtomic extends Mixin(
    [ DifferenceTemplateStreamed ],
    (base : ClassUnion<typeof DifferenceTemplateStreamed>) =>

    class DifferenceTemplateAtomic extends base {
        tagName         : string            = 'difference_template_atomic'

        childNodes      : [ Serialization | MissingValue, Serialization | MissingValue ]


        renderSelfLeft (
            renderer        : XmlRendererDifference,
            output          : TextBlock,
            context         : XmlRenderingDynamicContextDifference
        ) {
            this.renderChildInner(this.childNodes[ 0 ], 0, renderer, output, context)
        }


        renderSelfRight (
            renderer        : XmlRendererDifference,
            output          : TextBlock,
            context         : XmlRenderingDynamicContextDifference
        ) {
            this.renderChildInner(this.childNodes[ 1 ], 1, renderer, output, context)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateReferenceableAtomic extends Mixin(
    [ DifferenceTemplateReferenceable, DifferenceTemplateAtomic ],
    (base : ClassUnion<typeof DifferenceTemplateReferenceable, typeof DifferenceTemplateAtomic>) =>

    class DifferenceTemplateReferenceableAtomic extends base {
        tagName         : string            = 'difference_template_referenceable_atomic'
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateReference extends DifferenceTemplateStreamed {
    props   : DifferenceTemplateElement[ 'props' ] & {
        refId1?          : number
        refId2?          : number
    }


    renderSelfLeft (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        output.write(`[Circular *${ this.getAttribute('refId1') }]`)
    }


    renderSelfRight (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        output.write(`[Circular *${ this.getAttribute('refId2') }]`)
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateHeterogeneous extends DifferenceTemplateStreamed {
    tagName         : 'difference_template_heterogeneous'           = 'difference_template_heterogeneous'


    renderSelfLeft (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        output.push(ColoredStringSuppressSyncPoints.new())

        this.renderChildInner(this.childNodes[ 0 ], 0, renderer, output, context)

        output.push(ColoredStringResumeSyncPoints.new())
    }


    renderSelfRight (
        renderer        : XmlRendererDifference,
        output          : TextBlock,
        context         : XmlRenderingDynamicContextDifference
    ) {
        output.push(ColoredStringSuppressSyncPoints.new())

        this.renderChildInner(this.childNodes[ 1 ], 1, renderer, output, context)

        output.push(ColoredStringResumeSyncPoints.new())
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
        const shadowContext = (currentStream : 'left' | 'right' | 'middle') => XmlRenderingDynamicContextDifference.new({
            parentContext : context.parentContext, element : this, currentStream
        })

        const stream = (stream : 'left' | 'right' | 'middle', output : TextBlock, header : string) => {
            output.write(header)
            output.push('\n\n', ColoredStringSyncPoint.new({ el : this }))

            super.renderSelf(renderer, output, shadowContext(stream))
        }

        //----------------
        // first render the middle stream to determine the remaining available with for left/right streams
        const middle        = TextBlock.new()

        stream('middle', middle, ' ')

        //----------------
        // the wrapper for content in the middle stream ` |CONTENT| ` is 4 chars length
        const available     = output.maxLen - (middle.maxLineLength + 4)

        // extra 1 space because of the possibly oddity of the `available` goes to the left region
        const left          = TextBlock.new({ maxLen : Math.round(available / 2) })
        const right         = TextBlock.new({ maxLen : Math.floor(available / 2) })

        stream('left', left, 'Received')
        stream('right', right, 'Expected')

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
                }
                else if (command instanceof ColoredStringSuppressSyncPoints) {
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
                while (block.text.length < maxLines) {
                    const lastLine      = block.lastLine.toString()

                    block.addNewLine()

                    // preserve the empty space in the beginning of the sync point for left/right streams
                    if (block !== middleBlock && /^\s+$/.test(lastLine)) block.push(lastLine)
                }
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


        needCommaAfterChild (
            child               : DifferenceTemplateArrayEntry,
            index               : number,
            renderer            : XmlRendererDifference,
            context             : XmlRenderingDynamicContextDifference
        )
            : boolean
        {
            const stream        = context.currentStream === 'left' ? 'left' : 'right'

            if (
                child.isMissingIn(stream)
                ||
                (stream === 'right' && child.getAttribute('index') >= this.getAttribute('length2') - 1)
                ||
                (stream === 'left' && child.getAttribute('index') >= this.getAttribute('length') - 1)
            ) {
                return false
            } else {
                return super.needCommaAfterChild(child, index, renderer, context)
            }
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
export class DifferenceTemplateObject extends Mixin(
    // note, that `SerializationObject` and `DifferenceTemplateComposite` are not ordered
    // (the order of their application is not defined)
    // this still works correctly, because they override different methods
    // the same applies to all other mixins, that uses `Serialization*` mixins
    [ SerializationObject, DifferenceTemplateComposite ],
    (base : ClassUnion<typeof SerializationObject, typeof DifferenceTemplateComposite>) =>

    class DifferenceTemplateObject extends base {
        tagName         : string            = 'difference_template_object'

        props           : SerializationObject[ 'props' ] & DifferenceTemplateComposite[ 'props' ] & {
            constructorName2?       : string
            size2?                  : number

            onlyIn2Size?            : number
        }

        childNodes      : DifferenceTemplateObjectEntry[]


        getConstructorName (
            renderer    : XmlRendererDifference,
            context     : XmlRenderingDynamicContextDifference
        ) {
            return context.currentStream === 'left' ? this.getAttribute('constructorName') : this.getAttribute('constructorName2')
        }


        getOnlyIn2Size () : number {
            return this.getAttribute('onlyIn2Size')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateObjectEntry extends Mixin(
    [ SerializationObjectEntry, DifferenceTemplateElement ],
    (base : ClassUnion<typeof SerializationObjectEntry, typeof DifferenceTemplateElement>) =>

    class DifferenceTemplateObjectEntry extends base {
        props           : DifferenceTemplateElement[ 'props' ]

        tagName         : string                = 'difference_template_object_entry'


        renderSelf (
            renderer        : XmlRendererDifference,
            output          : TextBlock,
            context         : XmlRenderingDynamicContextDifference
        ) {
            if (context.currentStream === 'middle') {
                output.push(' ')

                this.renderChildren(renderer, output, context)
            } else {
                super.renderSelf(renderer, output, context)
            }
        }


        valueIsAtomic (valueEl : DifferenceTemplateElement, renderer : XmlRendererSerialization, context : XmlRenderingDynamicContext) : boolean {
            return valueEl.tagName.toLowerCase() === 'difference_template_atomic'
        }
    }
){}

//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateSet extends Mixin(
    [ SerializationSet, DifferenceTemplateComposite ],
    (base : ClassUnion<typeof SerializationSet, typeof DifferenceTemplateComposite>) =>

    class DifferenceTemplateSet extends base {
        props           : SerializationSet[ 'props' ] & DifferenceTemplateComposite[ 'props' ] & {
            size2?              : number

            onlyIn2Size?        : number
        }

        tagName         : string            = 'difference_template_set'

        childNodes      : DifferenceTemplateElement[]


        getSize (context : XmlRenderingDynamicContextDifference) : number {
            return context.currentStream === 'left' ? this.getAttribute('size') : this.getAttribute('size2')
        }


        getOnlyIn2Size () : number {
            return this.getAttribute('onlyIn2Size')
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
            size2?              : number

            onlyIn2Size?        : number
        }

        tagName         : string            = 'difference_template_map'

        childNodes      : DifferenceTemplateMapEntry[]


        getSize (context : XmlRenderingDynamicContextDifference) : number {
            return context.currentStream === 'left' ? this.getAttribute('size') : this.getAttribute('size2')
        }


        getOnlyIn2Size () : number {
            return this.getAttribute('onlyIn2Size')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class DifferenceTemplateMapEntry extends Mixin(
    [ SerializationMapEntry, DifferenceTemplateElement ],
    (base : ClassUnion<typeof SerializationMapEntry, typeof DifferenceTemplateElement>) =>

    class DifferenceTemplateMapEntry extends base {
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
                super.renderSelf(renderer, output, context)
            }
        }


        valueIsAtomic (renderer : XmlRendererDifference, context : XmlRenderingDynamicContextDifference) : boolean {
            const valueDiffEl       = this.childNodes[ 1 ] as XmlElement

            if (valueDiffEl.tagName.toLowerCase() === 'difference_template_atomic') {
                const childIndex        = context.currentStream === 'left' ? 0 : 1

                const serializedNode    = (valueDiffEl as DifferenceTemplateAtomic).childNodes[ childIndex ] as XmlElement

                if (serializedNode instanceof MissingValue) {
                    throw new Error("Should never try to render a missing element")
                } else
                    return renderer.atomicElementNodes.has(serializedNode.tagName.toLowerCase())
            } else {
                return false
            }
        }
    }
){}
