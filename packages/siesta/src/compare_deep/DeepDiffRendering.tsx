import { CI } from "chained-iterator"
import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { exclude, Serializable, serializable } from "typescript-serializable-mixin"
import {
    RenderCanvas,
    RenderingXmlFragment,
    RenderingXmlFragmentWithCanvas,
    XmlRenderBlock
} from "../jsx/RenderBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRendererStreaming } from "../jsx/XmlRenderer.js"
import { luid, LUID } from "../siesta/common/LUID.js"
import { ArbitraryObjectKey, constructorNameOf, lastElement, typeOf } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Missing, serializeAtomic } from "./DeepDiff.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DifferenceRenderingStream   = 'expander' | 'left' | 'middle' | 'right'

export class DifferenceRenderingContext extends Base {
    stream          : DifferenceRenderingStream     = undefined


    get contentStream () : 'left' | 'right' {
        if (this.stream === 'left') return 'left'
        if (this.stream === 'right') return 'right'

        throw new Error("Should only be called on left/right streams")
    }


    // get oppositeContentStream () : 'left' | 'right' {
    //     if (this.stream === 'left') return 'right'
    //     if (this.stream === 'right') return 'left'
    //
    //     throw new Error("Should only be called on left/right streams")
    // }


    choose<V> (v1 : V, v2 : V) : V {
        return this.contentStream === 'left' ? v1 : v2
    }


    get isContent () : boolean {
        return this.stream === 'left' || this.stream === 'right'
    }


    get isExpander () : boolean {
        return this.stream === 'expander'
    }


    get isMiddle () : boolean {
        return this.stream === 'middle'
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceRenderingSyncPoint extends Base {
    type            : 'before' | 'after'        = 'after'
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceRendering extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class DifferenceRendering extends base {
        * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
            yield* this.beforeRenderContentGen(output, context)
            yield* this.renderContentGen(output, context)
            yield* this.afterRenderContentGen(output, context)
        }


        * beforeRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        }


        * renderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        }


        * afterRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        }


        render (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
            CI(this.renderGen(output, context)).flush()
        }
    }
){}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DifferenceType = 'both' | 'onlyIn1' | 'onlyIn2'

@serializable({ id : 'Difference' })
export class Difference extends Mixin(
    [ DifferenceRendering, Serializable, Base ],
    (base : ClassUnion<typeof DifferenceRendering, typeof Serializable, typeof Base>) =>

    class Difference extends base {
        id              : LUID                      = luid()

        @exclude()
        value1          : unknown | Missing         = Missing

        @exclude()
        value2          : unknown | Missing         = Missing

        $same           : boolean                   = false

        $type           : DifferenceType            = undefined


        initialize (props : Partial<Difference>) {
            super.initialize(props)

            if (this.type === undefined) {
                const has1  = this.value1 !== Missing
                const has2  = this.value2 !== Missing

                this.$type  = has1 && has2 ? 'both' : has1 ? 'onlyIn1' : 'onlyIn2'
            }
        }


        get same () : boolean {
            return this.$same
        }


        get type () : DifferenceType {
            return this.$type
        }


        excludeValue (valueProp : 'value1' | 'value2') {
            this[ valueProp ]   = Missing

            this.$same          = false

            // meh, mutations
            if (this.type === 'both') this.$type = valueProp === 'value1' ? 'onlyIn2' : 'onlyIn1'
        }


        template () : JsonDeepDiffElement {
            return JsonDeepDiffElement.new({
                difference  : this
            })
        }


        isMissingIn (stream : 'left' | 'right') : boolean {
            const type      = this.type

            return stream === 'left' && type === 'onlyIn2' || stream === 'right' && type === 'onlyIn1'
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const compareDifferences = (difference1 : Difference, difference2 : Difference) : number => {
    const type1     = difference1.type
    const type2     = difference1.type

    if (type1 === 'both' && type2 !== 'both')
        return -1
    else if (type1 !== 'both' && type2 === 'both')
        return 1
    else if (type1 === 'both' && type2 === 'both')
        return (difference1.$same ? 0 : 1) - (difference2.$same ? 0 : 1)
    else if (type1 === 'onlyIn1' && type2 === 'onlyIn2')
        return -1
    else if (type1 === 'onlyIn2' && type2 === 'onlyIn1')
        return 1
    else
        return 0
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceWrapper' })
export class DifferenceWrapper extends Difference {
    difference      : Difference        = undefined

    '---'

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        output.push(<diff-entry /*same={ this.difference.same } type={ this.difference.type }*/></diff-entry>)

        yield DifferenceRenderingSyncPoint.new({ type : 'before' })

        yield* this.difference.renderGen(output, context)

        yield DifferenceRenderingSyncPoint.new({ type : 'after' })

        output.pop()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceAtomic' })
export class DifferenceAtomic extends Difference {

    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateAtomic
    //         type={ this.type } same={ this.same }
    //     >
    //         { this.value1 === Missing ? <MissingValue></MissingValue> : diffState[ 0 ].serialize(this.value1) }
    //         { this.value2 === Missing ? <MissingValue></MissingValue> : diffState[ 1 ].serialize(this.value2) }
    //     </DifferenceTemplateAtomic>
    // }

    content1        : string | Missing  = Missing
    content2        : string | Missing  = Missing

    typeOf1         : string            = undefined
    typeOf2         : string            = undefined


    initialize (props : Partial<Difference>) {
        super.initialize(props)

        this.content1       = serializeAtomic(this.value1)
        this.content2       = serializeAtomic(this.value2)

        this.typeOf1        = typeOf(this.value1)
        this.typeOf2        = typeOf(this.value2)
    }


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        if (valueProp === 'value1')
            this.content1   = Missing
        else
            this.content2   = Missing
    }


    * renderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        const stream        = context.stream

        if (context.isContent) {
            const value     = context.choose(this.content1, this.content2)

            output.write(<diff-atomic same={ this.same } type={ this.type }>
                {
                    value === Missing ? <MissingValue></MissingValue> : value
                }
            </diff-atomic>)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceReferenceable extends Mixin(
    [ Difference ],
    (base : ClassUnion<typeof Difference>) =>

    class DifferenceReferenceable extends base {
        // these properties contain the "reference id" (rendered as <ref *1>) - the id, other
        // data can reference to (rendered as [Circular *1]
        refId1          : number            = undefined
        refId2          : number            = undefined

        // these properties contain the reference id, when the same data structure
        // is traversed several times, because the other side has a cycle of different
        // structure, in such case this repeated traversal is indicated with
        // <circular *1>
        circular1       : number            = undefined
        circular2       : number            = undefined


        renderReferenceablePrefix (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
            const circularId    = context.choose(this.circular1, this.circular2)

            if (circularId !== undefined)
                output.write(<span class="circular-id">{ `<circular *${ circularId }> ` }</span>)
            else {
                const refId     = context.choose(this.refId1, this.refId2)

                if (refId !== undefined) output.write(<span class="reference-id">{ `<ref *${ refId }> ` }</span>)
            }
        }


        * beforeRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
            if (context.isContent) this.renderReferenceablePrefix(output, context)

            yield* super.beforeRenderContentGen(output, context)
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceReferenceableAtomic extends Mixin(
    // unordered mixins combination! order of clashing methods is not defined
    [ DifferenceReferenceable, DifferenceAtomic ],
    (base : ClassUnion<typeof DifferenceReferenceable, typeof DifferenceAtomic>) =>

    class DifferenceReferenceableAtomic extends base {

        // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
        //     return <DifferenceTemplateReferenceableAtomic
        //         type={ this.type } same={ this.same } refId={ this.refId1 } refId2={ this.refId2 }
        //         circular1 = { this.circular1 } circular2 = { this.circular2 }
        //     >
        //         { this.value1 === Missing ? <MissingValue></MissingValue> : diffState[ 0 ].serialize(this.value1) }
        //         { this.value2 === Missing ? <MissingValue></MissingValue> : diffState[ 1 ].serialize(this.value2) }
        //     </DifferenceTemplateReferenceableAtomic>
        // }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceComposite extends DifferenceReferenceable {

    entries         : DifferenceCompositeEntry[]    = []


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.entries.forEach(entry => entry.difference.excludeValue(valueProp))
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isExpander) {
            output.push(
                <diff-expander id={ `${ context.stream }-${ this.id }` }>
                    {/*<diff-expander-line></diff-expander-line>*/}
                    {/*<diff-expander-controls>*/}
                    {/*    <diff-expander-opener></diff-expander-opener>*/}
                    {/*    <diff-expander-closer></diff-expander-closer>*/}
                    {/*</diff-expander-controls>*/}
                </diff-expander>
            )
        } else if (context.isMiddle) {
            output.push(
                <diff-middle id={ `${ context.stream }-${ this.id }` }>
                </diff-middle>
            )
        }

        yield* super.renderGen(output, context)

        if (context.isExpander) output.pop()
        if (context.isMiddle) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        // zero-width space, previously it was just:
        //      output.write(String.fromCharCode(0x200B))
        // but this was messing up the calculations for the text rendering
        // (since its an unprinted character, that, however, is counted in the JS string length)
        // so need a special processing for it, which is done in `ZeroWidthSpace`
        if (context.isExpander || context.isMiddle)
            output.write(<ZeroWidthSpace class="json-deep-diff-zero-width-space"></ZeroWidthSpace>)
    }


    * renderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent && this.isMissingIn(context.contentStream)) {
            output.write(<MissingValue></MissingValue>)
        } else {
            const hasInner              = this.entries.length > 0
            const suppressSyncPoints    = this.type !== 'both'

            this.renderCompositeHeader(output, context)

            if (context.isContent && hasInner) output.push(<diff-inner class="indented"></diff-inner>)
            if (context.isExpander && hasInner) output.push(
                <diff-expander-inner>
                    {
                        !suppressSyncPoints && <diff-expander-controls>
                            <diff-expander-line></diff-expander-line>
                            <diff-expander-opener></diff-expander-opener>
                            <diff-expander-closer></diff-expander-closer>
                        </diff-expander-controls>
                    }
                </diff-expander-inner>
            )

            for (let i = 0; i < this.entries.length; i++) {
                const entry     = this.entries[ i ]

                // the entry element presents in all flows and this is what
                // is synchronizing the height across the streams
                output.push(<diff-entry /*same={ entry.same } type={ entry.type }*/></diff-entry>)

                if (!suppressSyncPoints) yield DifferenceRenderingSyncPoint.new({ type : 'before' })

                yield* this.renderChildGen(output, context, entry, i)

                // yielding the sync-point right _before_ the `pop` of the entry
                // entry is still a "currentElement" of the `output`
                // since `diff-entry` does not add any custom rendering,
                // all the entry content is available (only need to flush
                // the inline buffer of the entry's last child)
                if (!suppressSyncPoints) yield DifferenceRenderingSyncPoint.new({ type : 'after' })

                output.pop()
            }

            if (context.isContent && hasInner) output.pop()
            if (context.isExpander && hasInner) output.pop()

            this.renderCompositeFooter(output, context)
        }
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        // zero-width space, see the comment above
        if (context.isExpander || context.isMiddle)
            output.write(<ZeroWidthSpace class="json-deep-diff-zero-width-space"></ZeroWidthSpace>)
    }


    * beforeRenderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceCompositeEntry,
        index               : number
    )
        : Generator<DifferenceRenderingSyncPoint>
    {
    }


    * renderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceCompositeEntry,
        index               : number
    )
        : Generator<DifferenceRenderingSyncPoint>
    {
        yield* this.beforeRenderChildGen(output, context, child, index)

        yield* child.renderGen(output, context)

        yield* this.afterRenderChildGen(output, context, child, index)
    }


    * afterRenderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceCompositeEntry,
        index               : number
    )
        : Generator<DifferenceRenderingSyncPoint>
    {
        if (context.isContent && this.needCommaAfterChild(child, index, context)) output.write(',')
    }


    getOnlyIn2Size () : number {
        throw new Error('Abstract method')
    }


    needCommaAfterChild (
        child               : Difference,
        index               : number,
        context             : DifferenceRenderingContext
    )
        : boolean
    {
        const stream        = context.contentStream
        const nextChild     = this.entries[ index + 1 ]

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
            return index !== this.entries.length - 1
        }
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceCompositeEntry extends Difference {
    index       : number            = undefined

    difference  : Difference        = undefined


    excludeValue (valueProp : 'value1' | 'value2') {
        this.difference.excludeValue(valueProp)
    }


    get type () : DifferenceType {
        return this.difference.type
    }


    get same () : boolean {
        return this.difference.same
    }

    '--'

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        yield* this.difference.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceArrayEntry extends DifferenceCompositeEntry {

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isMiddle) output.write(<span class="json-deep-diff-middle-index">{ this.index }</span>)

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceArray extends DifferenceComposite {
    value1          : unknown[]
    value2          : unknown[]

    $same           : boolean           = true

    entries         : DifferenceArrayEntry[]

    length          : number            = undefined
    length2         : number            = undefined


    initialize (props : Partial<DifferenceArray>) {
        super.initialize(props)

        this.length     = this.value1.length
        this.length2    = this.value2.length
    }


    addComparison (index : number, difference : Difference) {
        this.entries.push(DifferenceArrayEntry.new({ index, difference }))

        if (this.$same && !difference.$same) this.$same = false
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-array id={ `${ context.stream }-${ this.id }` } same={ this.same } type={ this.type }></diff-array>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) output.write('[')
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write(']')
    }


    needCommaAfterChild (
        child               : DifferenceArrayEntry,
        index               : number,
        context             : DifferenceRenderingContext
    )
        : boolean
    {
        const stream        = context.contentStream

        if (
            child.isMissingIn(stream)
            ||
            (stream === 'right' && child.index >= this.length2 - 1)
            ||
            (stream === 'left' && child.index >= this.length - 1)
        ) {
            return false
        } else {
            return super.needCommaAfterChild(child, index, context)
        }
    }



    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateArray
    //         type={ this.type } same={ this.same }
    //         length={ this.value1.length } length2={ this.value2.length }
    //         refId = { this.refId1 } refId2 = { this.refId2 }
    //         circular1 = { this.circular1 } circular2 = { this.circular2 }
    //     >{
    //         this.comparisons.map(({ index, difference }) =>
    //             <DifferenceTemplateArrayEntry type={ difference.type } index={ index } same={ difference.same }>
    //                 { difference.templateInner(serializerConfig, diffState) }
    //             </DifferenceTemplateArrayEntry>
    //         )
    //     }</DifferenceTemplateArray>
    // }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceObjectEntry extends DifferenceCompositeEntry {
    key             : string            = undefined

    '---'


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent && !this.isMissingIn(context.contentStream)) {
            output.write(
                <diff-object-key same={ this.difference.type === 'both' ? 'true' : undefined } type={ this.difference.type }>
                    { this.key }
                </diff-object-key>
            )
            output.write(': ')
        }

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceObject extends DifferenceComposite {
    value1          : object | Missing
    value2          : object | Missing

    onlyIn2Size         : number                = 0
    constructorName     : string                = undefined
    constructorName2    : string                = undefined

    size                : number                = 0
    size2               : number                = 0

    $same           : boolean                   = true

    entries         : DifferenceObjectEntry[]


    initialize (props : Partial<DifferenceArray>) {
        super.initialize(props)

        this.constructorName    = this.value1 !== Missing ? constructorNameOf(this.value1) : undefined
        this.constructorName2   = this.value2 !== Missing ? constructorNameOf(this.value2) : undefined
        this.size               = this.value1 !== Missing ? Object.keys(this.value1).length : undefined
        this.size2              = this.value2 !== Missing ? Object.keys(this.value2).length : undefined
    }


    addComparison (key : ArbitraryObjectKey, difference : Difference) {
        this.entries.push(DifferenceObjectEntry.new({ key : serializeAtomic(key), difference }))

        if (this.$same && !difference.$same) this.$same = false
    }


    getOnlyIn2Size () : number {
        return this.onlyIn2Size
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) {
            const className     = context.choose(this.constructorName, this.constructorName2)

            if (className && className !== 'Object') output.write(className + ' ')

            output.write('{')
        }
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write('}')
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-object id={ `${ context.stream }-${ this.id }` } same={ this.same } type={ this.type }></diff-object>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateObject
    //         type={ this.type } same={ this.same }
    //         constructorName={ this.value1 !== Missing ? constructorNameOf(this.value1) : undefined }
    //         constructorName2={ this.value2 !== Missing ? constructorNameOf(this.value2) : undefined }
    //         size={ this.value1 !== Missing ? Object.keys(this.value1).length : undefined }
    //         size2={ this.value2 !== Missing ? Object.keys(this.value2).length : undefined }
    //         onlyIn2Size={ this.onlyIn2Size }
    //         refId={ this.refId1 } refId2={ this.refId2 }
    //         circular1 = { this.circular1 } circular2 = { this.circular2 }
    //     >{
    //         this.comparisons
    //             .sort((comp1, comp2) => compareDifferences(comp1.difference, comp2.difference))
    //             .map(
    //                 ({ key, difference }) =>
    //                 <DifferenceTemplateObjectEntry type={ difference.type }>
    //                     <DifferenceTemplateAtomic type={ difference.type } same={ difference.type === 'both' ? true : false }>
    //                         { difference.type === 'onlyIn2' ? <MissingValue></MissingValue> : diffState[ 0 ].serialize(key) }
    //                         { difference.type === 'onlyIn1' ? <MissingValue></MissingValue> : diffState[ 1 ].serialize(key) }
    //                     </DifferenceTemplateAtomic>
    //                     { difference.templateInner(serializerConfig, diffState) }
    //                 </DifferenceTemplateObjectEntry>
    //             )
    //     }</DifferenceTemplateObject>
    // }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceSetEntry extends DifferenceCompositeEntry {
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceSet extends DifferenceComposite {
    value1          : Set<unknown>
    value2          : Set<unknown>

    onlyIn2Size     : number                    = 0

    size            : number                    = undefined
    size2           : number                    = undefined

    $same           : boolean                   = true

    entries         : DifferenceSetEntry[]


    initialize (props : Partial<DifferenceArray>) {
        super.initialize(props)

        this.size       = this.value1.size
        this.size2      = this.value2.size
    }


    getOnlyIn2Size () : number {
        return this.onlyIn2Size
    }


    addComparison (difference : Difference) {
        this.entries.push(DifferenceSetEntry.new({ difference }))

        if (this.$same && !difference.$same) this.$same = false
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-set id={ `${ context.stream }-${ this.id }` } same={ this.same } type={ this.type }></diff-set>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) output.write(`Set (${ context.choose(this.size, this.size2) }) {`)
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write('}')
    }

    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateSet
    //         type={ this.type } same={ this.same }
    //         size={ this.value1.size } size2={ this.value2.size }
    //         onlyIn2Size={ this.onlyIn2Size }
    //         refId={ this.refId1 } refId2={ this.refId2 }
    //         circular1 = { this.circular1 } circular2 = { this.circular2 }
    //     >{
    //         this.comparisons.map(({ difference }) =>
    //             <DifferenceTemplateSetEntry type={ difference.type }>
    //                 { difference.templateInner(serializerConfig, diffState) }
    //             </DifferenceTemplateSetEntry>)
    //     }</DifferenceTemplateSet>
    // }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceMapEntry extends DifferenceCompositeEntry {
    differenceKeys          : Difference        = undefined

    '---'


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent && this.isMissingIn(context.contentStream)) {
            output.write(<MissingValue></MissingValue>)
        } else {
            if (context.isContent && !this.isMissingIn(context.contentStream)) {
                output.push(<diff-map-key same={ this.differenceKeys.same } type={ this.differenceKeys.type }></diff-map-key>)

                yield* this.differenceKeys.renderGen(output, context)

                output.write(' => ')

                output.pop()

            } else {
                yield* this.differenceKeys.renderGen(output, context)
            }

            yield* super.renderGen(output, context)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceMap extends DifferenceComposite {
    value1          : Map<unknown, unknown>
    value2          : Map<unknown, unknown>

    size            : number                    = undefined
    size2           : number                    = undefined

    onlyIn2Size     : number                    = 0

    $same           : boolean                   = true

    entries         : DifferenceMapEntry[]


    initialize (props : Partial<DifferenceArray>) {
        super.initialize(props)

        this.size       = this.value1.size
        this.size2      = this.value2.size
    }


    getOnlyIn2Size () : number {
        return this.onlyIn2Size
    }


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.entries.forEach(entry => entry.differenceKeys.excludeValue(valueProp))
    }


    addComparison (differenceKeys : Difference, difference : Difference) {
        this.entries.push(DifferenceMapEntry.new({ differenceKeys, difference }))

        if (this.$same && (!differenceKeys.$same || !difference.$same)) this.$same = false
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-map id={ `${ context.stream }-${ this.id }` } same={ this.same } type={ this.type }></diff-map>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) output.write(`Map (${ context.choose(this.size, this.size2) }) {`)
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write('}')
    }



    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateMap
    //         type={ this.type } same={ this.same }
    //         size={ this.value1.size } size2={ this.value2.size }
    //         onlyIn2Size={ this.onlyIn2Size }
    //         refId={ this.refId1 } refId2={ this.refId2 }
    //         circular1 = { this.circular1 } circular2 = { this.circular2 }
    //     >{
    //         this.comparisons
    //             .sort((comp1, comp2) => compareDifferences(comp1.differenceValues, comp2.differenceValues))
    //             .map(({ differenceKeys, differenceValues }) =>
    //                 <DifferenceTemplateMapEntry type={ differenceKeys.type }>
    //                     { differenceKeys.templateInner(serializerConfig, diffState) }
    //                     { differenceValues.templateInner(serializerConfig, diffState) }
    //                 </DifferenceTemplateMapEntry>
    //             )
    //     }</DifferenceTemplateMap>
    // }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceReference extends Difference {
    value1      : number | Missing
    value2      : number | Missing

    ref1        : number | Missing          = Missing
    ref2        : number | Missing          = Missing


    initialize (props : Partial<DifferenceArray>) {
        super.initialize(props)

        // `value1` and `value2` are not persistable, so need to copy them to another property
        this.ref1       = this.value1
        this.ref2       = this.value2
    }


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        if (valueProp === 'value1')
            this.ref1   = Missing
        else
            this.ref2   = Missing
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) {
            const ref       = context.choose(this.ref1, this.ref2)

            if (ref === Missing)
                output.write(<MissingValue></MissingValue>)
            else
                output.write(<span class="json-deep-diff-reference">[Circular *{ ref }]</span>)
        }
    }


    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateReference type={ this.type } same={ this.same } refId1={ this.value1 } refId2={ this.value2 }>
    //     </DifferenceTemplateReference>
    // }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceHeterogeneous extends Difference {
    // heterogeneous values (values of different type) are pretty much always unequal
    // however, they can be equal in the case of comparing with fuzzy matcher (like `anyInstanceOf/any`)

    value1      : Difference | Missing
    value2      : Difference | Missing

    difference1     : Difference | Missing
    difference2     : Difference | Missing


    initialize (props : Partial<Difference>) {
        super.initialize(props)

        // `value1/2` are not persistent, need to copy the diffs into different properties
        this.difference1    = this.value1
        this.difference2    = this.value2
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) {
            const difference    = context.choose(this.difference1, this.difference2)

            if (difference === Missing)
                output.write(<MissingValue></MissingValue>)
            else {
                output.push(<diff-hetero></diff-hetero>)
                yield* difference.renderGen(output, context)
                output.pop()
            }
        }
    }


    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateHeterogeneous type={ this.type } same={ this.same }>
    //         { this.value1 !== Missing ? this.value1.templateInner(serializerConfig, diffState) : <MissingValue></MissingValue> }
    //         { this.value2 !== Missing ? this.value2.templateInner(serializerConfig, diffState) : <MissingValue></MissingValue> }
    //     </DifferenceTemplateHeterogeneous>
    // }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRendererDifference extends Mixin(
    [ XmlRendererStreaming ],
    (base : ClassUnion<typeof XmlRendererStreaming>) =>

    class XmlRendererDifference extends base {

        initialize (props? : Partial<XmlRendererDifference>) {
            super.initialize(props)

            this.blockLevelElements.add('diff-entry')
            this.blockLevelElements.add('diff-inner')
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffContentRendering extends Base {
    renderer        : XmlRendererDifference     = undefined

    maxWidth        : number                    = Number.MAX_SAFE_INTEGER

    stream          : DifferenceRenderingStream = undefined

    difference      : Difference                = undefined

    output          : RenderingXmlFragmentWithCanvas    = undefined

    canvas          : RenderCanvas              = undefined


    initialize (props? : Partial<JsonDeepDiffContentRendering>) {
        super.initialize(props)

        this.canvas     = RenderCanvas.new({ maxWidth : this.maxWidth })

        this.output     = RenderingXmlFragmentWithCanvas.new({
            canvas          : this.canvas,
            renderer        : this.renderer
        })

        this.output.start(
            XmlElement.new({
                tagName         : 'div',
                attributes      : { class : 'json-deep-diff-content-root' }
            })
        )
    }


    * render () : Generator<{ el : XmlElement, height : number }> {
        const output                                    = this.output
        const heightStart   : Map<XmlElement, number>   = new Map()

        const iterator      = this.difference.renderGen(output, DifferenceRenderingContext.new({ stream : this.stream }))

        for (const syncPoint of iterator) {
            if (syncPoint.type === 'before') {
                heightStart.set(output.currentElement, this.canvas.height)
            }
            else if (syncPoint.type === 'after') {
                const currentElement    = output.currentElement
                const lastChildEl       = lastElement(currentElement.childNodes)

                if (lastChildEl && !isString(lastChildEl)) output.blockByElement.get(lastChildEl).flushInlineBuffer()

                output.blockByElement.get(currentElement).flushInlineBuffer()

                yield {
                    el      : currentElement,
                    height  : this.canvas.height - heightStart.get(currentElement)
                }
            }
            else {
                throw new Error("Unknown sync point type")
            }
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffElement extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class JsonDeepDiffElement extends base {
        tagName             : 'div'             = 'div'

        difference          : Difference        = undefined


        getMiddleAreaMaxWidth (context : XmlRenderBlock) : number {
            const renderer      = JsonDeepDiffContentRendering.new({
                stream      : 'middle',
                difference  : this.difference,
                renderer    : context.renderer
            })

            CI(renderer.render()).flush()

            return renderer.canvas.maxWidthFact
        }


        renderContent (context : XmlRenderBlock) {
            // we have to render the middle stream twice, this first render pass
            // provides us with its max width, so we can calculate the width available
            // for left/right streams
            // middle stream might be empty, set the min width to 1
            const middleAreaMaxWidth    = Math.max(this.getMiddleAreaMaxWidth(context), 1)

            // the wrapper for content in the middle stream ` |CONTENT| ` is 4 chars length
            const available     = context.maxWidth - (middleAreaMaxWidth + 4)

            const renderers     = [
                JsonDeepDiffContentRendering.new({
                    stream      : 'left',
                    difference  : this.difference,
                    renderer    : context.renderer,
                    // extra 1 space because of the possible oddity of the `available` goes to the left region
                    maxWidth    : Math.round(available / 2)
                }),
                JsonDeepDiffContentRendering.new({
                    stream      : 'middle',
                    difference  : this.difference,
                    renderer    : context.renderer
                }),
                JsonDeepDiffContentRendering.new({
                    stream      : 'right',
                    difference  : this.difference,
                    renderer    : context.renderer,
                    maxWidth    : Math.floor(available / 2)
                })
            ]

            const leftCanvas        = renderers[ 0 ].canvas
            const middleCanvas      = renderers[ 1 ].canvas
            const rightCanvas       = renderers[ 2 ].canvas

            // "pre-render" some content
            leftCanvas.writePlain('Received')
            // this write will set the minimum width for middle canvas to 1 char
            middleCanvas.writePlain(' ')
            rightCanvas.writePlain('Expected')

            renderers.forEach(renderer => {
                renderer.canvas.newLine()
            })

            const iterators     = renderers.map(renderer => renderer.render())

            while (true) {
                const iterations        = iterators.map(iterator => iterator.next())

                if (iterations.every(iteration => iteration.done)) break

                if (iterations.every(iteration => !iteration.done)) {
                    const maxHeight     = Math.max(iterations[ 0 ].value.height, iterations[ 2 ].value.height)

                    iterations.forEach((iteration, index) => {
                        // this comparison is only used for typing purposes
                        // (TS can't track the `every !done` assertion from above)
                        if (iteration.done === false) {
                            const heightDiff    = maxHeight - iteration.value.height

                            if (heightDiff > 0)
                                renderers[ index ].output.write(
                                    JsonDeepDiffFitter.new({
                                        tagName : 'div',
                                        attributes : {
                                            class   : 'json-deep-diff-fitter',
                                            style   : `height: ${ 1.5 * heightDiff }em`
                                        },
                                        height      : heightDiff
                                    })
                                )
                        }
                    })
                } else
                    throw new Error("Elements flow de-synchronization")
            }

            const height            = leftCanvas.height

            if (renderers.some(renderer => renderer.canvas.height !== height)) throw new Error("Rendering flow de-synchronization")

            for (let i = 0; i < height; i++) {
                const leftLine      = leftCanvas.canvas[ i ]
                const middleLine    = middleCanvas.canvas[ i ]
                const rightLine     = rightCanvas.canvas[ i ]

                // TODO optimize the `toString` joining here, can push the line itself
                context.writeStyledSameLineText(leftLine.toString(), leftLine.length)
                const equalLengthRemainderLeft  = leftCanvas.maxWidthFact - leftLine.length
                context.writeStyledSameLineText(' '.repeat(equalLengthRemainderLeft), equalLengthRemainderLeft)

                const equalLengthRemainderMiddle = middleCanvas.maxWidthFact - middleLine.length

                context.writeStyledSameLineText(' │', 2)
                context.writeStyledSameLineText(' '.repeat(equalLengthRemainderMiddle), equalLengthRemainderMiddle)
                context.writeStyledSameLineText(middleLine.toString(), middleLine.length)
                context.writeStyledSameLineText('│ ', 2)

                context.writeStyledSameLineText(rightLine.toString(), rightLine.length)
                const equalLengthRemainderRight  = rightCanvas.maxWidthFact - rightLine.length
                context.writeStyledSameLineText(' '.repeat(equalLengthRemainderRight), equalLengthRemainderRight)

                if (i !== height - 1) context.write('\n')
            }
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffFitter extends XmlElement {
    tagName             : 'div'             = 'div'

    height              : number            = 1


    renderContent (context : XmlRenderBlock) {
        if (this.height > 1)
            // the `height` indicates how many empty lines we need in the output
            // a single `\n` already creates 2 lines - thus the special handling of such case
            context.write('\n'.repeat(this.height - 1))
        else
            context.writeStyledSameLineText('\u200B', 0)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Note: this element does not render any child element, instead it inserts a zero-width space in the output
export class ZeroWidthSpace extends XmlElement {
    tagName             : 'span'             = 'span'


    renderContent (context : XmlRenderBlock) {
        context.writeStyledSameLineText('\u200B', 0)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class MissingValue extends XmlElement {
    tagName             : 'missing_value'           = 'missing_value'


    renderContent (context : XmlRenderBlock) {
        context.write('░')
    }
}
