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
import { luid, LUID } from "../siesta/common/LUID.js"
import { ArbitraryObjectKey, constructorNameOf, lastElement, typeOf } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Missing, serializeAtomic } from "./DeepDiff.js"
import { XmlRendererDifference } from "./DeepDiffXmlRendererDifference.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DifferenceRenderingStream   = 'expander' | 'left' | 'middle' | 'right'

export class DifferenceRenderingContext extends Base {
    stream          : DifferenceRenderingStream     = undefined


    get contentStream () : 'left' | 'right' {
        if (this.stream === 'left') return 'left'
        if (this.stream === 'right') return 'right'

        throw new Error("Should only be called on left/right streams")
    }


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
            this.beforeRenderContentGen(output, context)
            yield* this.renderContentGen(output, context)
            this.afterRenderContentGen(output, context)
        }


        beforeRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        }


        * renderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        }


        afterRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
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


        get cls () : string {
            return this.same
                ? 'diff-same'
                : this.type === 'onlyIn1'
                    ? 'diff-only-in-1'
                    : this.type === 'onlyIn2'
                        ? 'diff-only-in-2'
                        : 'diff-not-same'
        }


        excludeValue (valueProp : 'value1' | 'value2') {
            this[ valueProp ]   = Missing

            this.$same          = false

            // meh, mutations
            if (this.type === 'both') this.$type = valueProp === 'value1' ? 'onlyIn2' : 'onlyIn1'
        }


        isMissingIn (stream : 'left' | 'right') : boolean {
            const type      = this.type

            return stream === 'left' && type === 'onlyIn2' || stream === 'right' && type === 'onlyIn1'
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TODO keeping for now, clean up if not needed
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


    get same () : boolean {
        return this.difference.same
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        output.push(<diff-entry></diff-entry>)

        yield DifferenceRenderingSyncPoint.new({ type : 'before' })

        yield* this.difference.renderGen(output, context)

        yield DifferenceRenderingSyncPoint.new({ type : 'after' })

        output.pop()
    }


    template () : JsonDeepDiffElement {
        return JsonDeepDiffElement.new({
            difference  : this
        })
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceAtomic' })
export class DifferenceAtomic extends Difference {

    content1        : string | Missing  = Missing
    content2        : string | Missing  = Missing

    typeOf1         : string            = undefined
    typeOf2         : string            = undefined


    initialize (props : Partial<Difference>) {
        super.initialize(props)

        this.content1       = this.value1 !== Missing ? serializeAtomic(this.value1) : Missing
        this.content2       = this.value2 !== Missing ? serializeAtomic(this.value2) : Missing

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

            const cls       = this.same
                ? 'diff-same'
                : this.type === 'onlyIn1'
                    ? 'diff-only-in-1'
                    : this.type === 'onlyIn2'
                        ? 'diff-only-in-2'
                        : 'diff-atomic-not-same'

            output.write(<diff-atomic class={ cls } same={ this.same } type={ this.type }>
                {
                    this.isMissingIn(context.contentStream) ? <MissingValue></MissingValue> : value
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


        beforeRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
            if (context.isContent) this.renderReferenceablePrefix(output, context)

            super.beforeRenderContentGen(output, context)
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceReferenceableAtomic' })
export class DifferenceReferenceableAtomic extends Mixin(
    // unordered mixins combination! order of clashing methods is not defined
    [ DifferenceReferenceable, DifferenceAtomic ],
    (base : ClassUnion<typeof DifferenceReferenceable, typeof DifferenceAtomic>) =>

    class DifferenceReferenceableAtomic extends base {
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceComposite extends DifferenceReferenceable {

    entries         : DifferenceCompositeEntry[]    = []


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.entries.forEach(entry => entry.difference.excludeValue(valueProp))
    }


    getEntryCls (entry : DifferenceCompositeEntry) : string {
        return undefined
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isExpander) {
            output.push(<diff-expander id={ `${ context.stream }-${ this.id }` }></diff-expander>)
        } else if (context.isMiddle) {
            output.push(<diff-middle id={ `${ context.stream }-${ this.id }` }></diff-middle>)
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
                output.push(<diff-entry class={ this.getEntryCls(entry) }></diff-entry>)

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


    beforeRenderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceCompositeEntry,
        index               : number
    )
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
        this.beforeRenderChildGen(output, context, child, index)

        yield* child.renderGen(output, context)

        this.afterRenderChildGen(output, context, child, index)
    }


    afterRenderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceCompositeEntry,
        index               : number
    )
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
@serializable({ id : 'DifferenceCompositeEntry' })
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
@serializable({ id : 'DifferenceArrayEntry' })
export class DifferenceArrayEntry extends DifferenceCompositeEntry {

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isMiddle) {
            const cls   = `json-deep-diff-middle-index ${ this.same ? 'diff-same' : '' }`

            output.write(<span class={ cls }>{ this.index }</span>)
        }

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceArray' })
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
        if (context.isContent) output.push(<diff-array id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-array>)

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
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceFuzzyArrayEntry' })
export class DifferenceFuzzyArrayEntry extends DifferenceCompositeEntry {

    // isFirstMissing      : boolean           = false


    '---'

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isMiddle && this.index !== undefined) {
            const cls   = `json-deep-diff-middle-index ${ this.same ? 'diff-same' : '' }`

            output.write(<span class={ cls }>{ this.index }</span>)
        }

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceFuzzyArray' })
export class DifferenceFuzzyArray extends DifferenceComposite {
    value1          : unknown[]
    value2          : unknown[]

    $same           : boolean           = true

    entries         : DifferenceFuzzyArrayEntry[]

    length          : number            = 0
    length2         : number            = 0

    onlyIn2Size     : number            = 0


    initialize (props : Partial<DifferenceArray>) {
        this.$type      = 'both'

        super.initialize(props)

        // this.length     = this.value1.length
        // this.length2    = this.value2.length
    }


    addComparison (index : number, difference : Difference) {
        this.entries.push(DifferenceFuzzyArrayEntry.new({ index, difference }))

        if (this.$same && !difference.$same) this.$same = false
    }


    getOnlyIn2Size () : number {
        return this.onlyIn2Size
    }

    // TODO see the comment in the `FuzzyMatcherArrayContaining`
    // beforeRenderChildGen (
    //     output              : RenderingXmlFragment,
    //     context             : DifferenceRenderingContext,
    //     child               : DifferenceFuzzyArrayEntry,
    //     index               : number
    // )
    // {
    //     // console.log("isFirstMissing", child.isFirstMissing)
    //     //
    //     // if (context.stream === 'right' && child.isFirstMissing) output.write(<div class='diff-missing-header'>Missing:</div>)
    // }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-array id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-array>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent)
            if (context.stream === 'right')
                output.write('~[')
            else
                output.write('[')
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
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceObjectEntry' })
export class DifferenceObjectEntry extends DifferenceCompositeEntry {
    key             : string            = undefined

    '---'


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent && !this.isMissingIn(context.contentStream)) {
            const cls   = this.type === 'both'
                ? 'diff-same'
                : this.type === 'onlyIn1'
                    ? 'diff-only-in-1'
                    : 'diff-only-in-2'

            output.write(
                <diff-object-key class={ cls } same={ this.type === 'both' ? 'true' : undefined } type={ this.type }>
                    { this.key }
                </diff-object-key>
            )
            output.write(': ')
        }

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceObject' })
export class DifferenceObject extends DifferenceComposite {
    value1              : object | Missing
    value2              : object | Missing

    onlyIn2Size         : number                = 0
    constructorName     : string                = undefined
    constructorName2    : string                = undefined

    size                : number                = 0
    size2               : number                = 0

    $same               : boolean               = true

    entries             : DifferenceObjectEntry[]


    initialize (props : Partial<DifferenceObject>) {
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
        if (context.isContent) output.push(<diff-object id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-object>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceFuzzyObjectEntry' })
export class DifferenceFuzzyObjectEntry extends DifferenceObjectEntry {
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceFuzzyObject' })
export class DifferenceFuzzyObject extends DifferenceComposite {
    value1              : object | Missing
    value2              : object | Missing

    onlyIn2Size         : number                = 0
    constructorName     : string                = undefined
    constructorName2    : string                = undefined

    size                : number                = 0
    size2               : number                = 0

    $same               : boolean               = true

    entries             : DifferenceFuzzyObjectEntry[]


    initialize (props : Partial<DifferenceObject>) {
        super.initialize(props)

        this.constructorName    = this.value1 !== Missing ? constructorNameOf(this.value1) : undefined
        this.constructorName2   = this.value2 !== Missing ? constructorNameOf(this.value2) : undefined
        this.size               = this.value1 !== Missing ? Object.keys(this.value1).length : undefined
        this.size2              = this.value2 !== Missing ? Object.keys(this.value2).length : undefined
    }


    addComparison (key : ArbitraryObjectKey, difference : Difference, ignoreSameFlag : boolean = false) {
        this.entries.push(DifferenceFuzzyObjectEntry.new({ key : serializeAtomic(key), difference }))

        if (!ignoreSameFlag && this.$same && !difference.$same) this.$same = false
    }


    getOnlyIn2Size () : number {
        return this.onlyIn2Size
    }


    getEntryCls (entry : DifferenceFuzzyObjectEntry) : string {
        return entry.type === 'onlyIn1' ? 'diff-fuzzy-object-only-in-1-entry' : super.getEntryCls(entry)
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) {
            const className     = context.choose(this.constructorName, this.constructorName2)

            if (className && className !== 'Object') output.write(className + ' ')

            output.write(context.stream === 'right' ? '~{' : '{')
        }
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : DifferenceRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write('}')
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent)
            if (context.stream === 'left')
                output.push(<diff-fuzzy-object-received id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-fuzzy-object-received>)
            else
                output.push(<diff-fuzzy-object id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-fuzzy-object>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceSetEntry' })
export class DifferenceSetEntry extends DifferenceCompositeEntry {
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceSet' })
export class DifferenceSet extends DifferenceComposite {
    value1          : Set<unknown>
    value2          : Set<unknown>

    onlyIn2Size     : number                    = 0

    size            : number                    = undefined
    size2           : number                    = undefined

    $same           : boolean                   = true

    entries         : DifferenceSetEntry[]


    initialize (props : Partial<DifferenceSet>) {
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
        if (context.isContent) output.push(<diff-set id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-set>)

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
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceMapEntry' })
export class DifferenceMapEntry extends DifferenceCompositeEntry {
    differenceKeys          : Difference        = undefined

    '---'


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent && this.isMissingIn(context.contentStream)) {
            output.write(<MissingValue></MissingValue>)
        } else {
            if (context.isContent && !this.isMissingIn(context.contentStream)) {
                output.push(<diff-map-key class={ this.cls } same={ this.differenceKeys.same } type={ this.differenceKeys.type }></diff-map-key>)

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
@serializable({ id : 'DifferenceMap' })
export class DifferenceMap extends DifferenceComposite {
    value1          : Map<unknown, unknown>
    value2          : Map<unknown, unknown>

    size            : number                    = undefined
    size2           : number                    = undefined

    onlyIn2Size     : number                    = 0

    $same           : boolean                   = true

    entries         : DifferenceMapEntry[]


    initialize (props : Partial<DifferenceMap>) {
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
        if (context.isContent) output.push(<diff-map id={ `${ context.stream }-${ this.id }` } class={ this.cls } same={ this.same } type={ this.type }></diff-map>)

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
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceReference' })
export class DifferenceReference extends Difference {
    value1      : number | Missing
    value2      : number | Missing

    ref1        : number | Missing          = Missing
    ref2        : number | Missing          = Missing


    initialize (props : Partial<DifferenceReference>) {
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

            if (this.isMissingIn(context.contentStream))
                output.write(<MissingValue></MissingValue>)
            else
                output.write(<span class="json-deep-diff-reference">[Circular *{ ref }]</span>)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'DifferenceHeterogeneous' })
export class DifferenceHeterogeneous extends Difference {
    // heterogeneous values (values of different type) are pretty much always unequal
    // however, they can be equal in the case of comparing with fuzzy matcher (like `anyInstanceOf/any`)

    value1      : Difference
    value2      : Difference

    difference1     : Difference            = undefined
    difference2     : Difference            = undefined


    initialize (props : Partial<DifferenceHeterogeneous>) {
        super.initialize(props)

        // `value1/2` are not persistent, need to copy the diffs into different properties
        this.difference1    = this.value1
        this.difference2    = this.value2

        // TODO!!! had to clear the `value1` and `value2` because those properties might be visited
        // by the serializer prior the `difference1/2` and thus, `difference1/2` will contain just references
        // to the values, but `value1/2` are not persisted...
        this.value1 = this.value2 = undefined
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) {
            const difference    = context.choose(this.difference1, this.difference2)

            if (this.isMissingIn(context.contentStream))
                output.write(<MissingValue></MissingValue>)
            else {
                output.push(<diff-hetero></diff-hetero>)
                yield* difference.renderGen(output, context)
                output.pop()
            }
        }
    }
}


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
@serializable({ id : 'JsonDeepDiffElement' })
export class JsonDeepDiffElement extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class JsonDeepDiffElement extends base {
        props           : XmlElement[ 'props' ] & {
            difference      : JsonDeepDiffElement[ 'difference' ]
        }

        tagName             : 'div'                 = 'div'

        difference          : DifferenceWrapper     = undefined


        getMiddleAreaMaxWidth (context : XmlRenderBlock) : number {
            const renderer      = JsonDeepDiffContentRendering.new({
                stream      : 'middle',
                difference  : this.difference,
                renderer    : context.renderer as XmlRendererDifference
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
                    renderer    : context.renderer as XmlRendererDifference,
                    // extra 1 space because of the possible oddity of the `available` goes to the left region
                    maxWidth    : Math.round(available / 2)
                }),
                JsonDeepDiffContentRendering.new({
                    stream      : 'middle',
                    difference  : this.difference,
                    renderer    : context.renderer as XmlRendererDifference
                }),
                JsonDeepDiffContentRendering.new({
                    stream      : 'right',
                    difference  : this.difference,
                    renderer    : context.renderer as XmlRendererDifference,
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


    get class () : string {
        return 'gray'
    }


    set class (value : string | string[]) {
        super.class = value
    }
}
