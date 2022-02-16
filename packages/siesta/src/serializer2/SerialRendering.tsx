import { CI } from "chained-iterator"
import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { exclude, Serializable, serializable } from "typescript-serializable-mixin"
import { FuzzyMatcher } from "../compare_deep/DeepDiffFuzzyMatcher.js"
import {
    RenderCanvas,
    RenderingXmlFragment,
    RenderingXmlFragmentWithCanvas,
    XmlRenderBlock
} from "../jsx/RenderBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRendererStreaming } from "../jsx/XmlRenderer.js"
import { luid, LUID } from "../siesta/common/LUID.js"
import { ArbitraryObjectKey, constructorNameOf, lastElement, typeOf } from "../util/Helpers.js"
import { isDate, isFunction, isString } from "../util/Typeguards.js"
import { serialize, SerialOptions } from "./Serial.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRendererSerial extends Mixin(
    [ XmlRendererStreaming ],
    (base : ClassUnion<typeof XmlRendererStreaming>) =>

    class XmlRendererSerialization extends base {
        prettyPrint                     : boolean       = false

        spaceBetweenElements            : boolean       = true

        spaceAfterOpeningBracketArray   : boolean       = false
        spaceAfterOpeningBracketObject  : boolean       = true

        // atomicElementNodes              : Set<string>   = new Set([
        //     'boolean', 'number', 'string', 'symbol',
        //     // these are actually "referencable atomics"
        //     'date', 'regexp', 'function'
        // ])


        // used mostly for testing
        printValue (value : unknown, canvas? : Partial<RenderCanvas>, serializationProps? : SerialOptions) : string {
            return this.render(serialize(value, serializationProps).template(), RenderCanvas.maybeNew(canvas))
        }


        getDisplayType (el : XmlNode) : 'block' | 'inline' {
            if (isString(el)) {
                return 'inline'
            } else {
                if (this.prettyPrint && (el.tagName === 'serial-entry' || el.tagName === 'serial-inner')) return 'block'

                return super.getDisplayType(el)
            }
        }


        customIndentation (block : XmlRenderBlock) : string[] {
            const el        = block.element

            if (this.prettyPrint && el.tagName === 'serial-inner') return [ ' '.repeat(this.indentLevel) ]
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type RenderingStream = 'expander' | 'content'

export class SerialRenderingContext extends Base {
    stream          : RenderingStream     = undefined


    get isContent () : boolean {
        return this.stream === 'content'
    }


    get isExpander () : boolean {
        return this.stream === 'expander'
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialRenderingSyncPoint extends Base {
    type            : 'before' | 'after'        = 'after'
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialRendering extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class SerialRendering extends base {
        * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
            this.beforeRenderContentGen(output, context)
            yield* this.renderContentGen(output, context)
            this.afterRenderContentGen(output, context)
        }


        beforeRenderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) {
        }


        * renderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        }


        afterRenderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) {
        }


        render (output : RenderingXmlFragment, context : SerialRenderingContext) {
            CI(this.renderGen(output, context)).flush()
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'Serial' })
export class Serial extends Mixin(
    [ SerialRendering, Serializable, Base ],
    (base : ClassUnion<typeof SerialRendering, typeof Serializable, typeof Base>) =>

    class Serial extends base {
        id              : LUID                      = luid()

        parent          : SerialComposite           = undefined

        @exclude()
        $value          : unknown                   = undefined


        get value () : this[ '$value' ] {
            return this.$value
        }

        set value (value : this[ '$value' ]) {
            this.$value = value
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialOutOfBreadth' })
export class SerialOutOfBreadth extends Serial {
    remains     : number        = 0

    '---'

    * renderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        const stream        = context.stream

        if (context.isContent) {
            output.write(<serial-out-of-breadth>... ({ this.remains } more)</serial-out-of-breadth>)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialOutOfDepth' })
export class SerialOutOfDepth extends Serial {
    constructorName         : string        = undefined

    '---'

    * renderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        const stream        = context.stream

        if (context.isContent) {
            output.write(<serial-out-of-depth>{ `▼ ${ this.constructorName ?? '' } {…}` }</serial-out-of-depth>)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialAtomic' })
export class SerialAtomic extends Serial {
    content         : string            = undefined

    typeOf          : string            = undefined


    initialize (props : Partial<Serial>) {
        super.initialize(props)

        if (this.content === undefined) {
            this.content        = serializeAtomic(this.value)
            this.typeOf         = typeOf(this.value)
        }
    }


    * renderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        const stream        = context.stream

        if (context.isContent) {
            output.write(<serial-atomic class={ 'serial-' + this.typeOf.toLowerCase() }>
                { this.content }
            </serial-atomic>)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialReferenceable extends Mixin(
    [ Serial ],
    (base : ClassUnion<typeof Serial>) =>

    class SerialReferenceable extends base {
        // these properties contain the "reference id" (rendered as <ref *1>) - the id, other
        // data can reference to (rendered as [Circular *1]
        refId          : number            = undefined


        renderReferenceablePrefix (output : RenderingXmlFragment, context : SerialRenderingContext) {
            const refId     = this.refId

            if (refId !== undefined) output.write(<span class="reference-id">{ `<ref *${ refId }> ` }</span>)
        }


        beforeRenderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) {
            if (context.isContent) this.renderReferenceablePrefix(output, context)

            super.beforeRenderContentGen(output, context)
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialReferenceableAtomic' })
export class SerialReferenceableAtomic extends Mixin(
    // unordered mixins combination! order of clashing methods is not defined
    [ SerialReferenceable, SerialAtomic ],
    (base : ClassUnion<typeof SerialReferenceable, typeof SerialAtomic>) =>

    class SerialReferenceableAtomic extends base {
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialComposite extends SerialReferenceable {
    entries         : Serial[]    = []


    addEntry (serialization : Serial) {
        this.entries.push(SerialCompositeEntry.new({ serialization }))
    }


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isExpander) output.push(<serial-expander id={ `${ context.stream }-${ this.id }` }></serial-expander>)

        yield* super.renderGen(output, context)

        if (context.isExpander) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : SerialRenderingContext) {
        // zero-width space, previously it was just:
        //      output.write(String.fromCharCode(0x200B))
        // but this was messing up the calculations for the text rendering
        // (since its an unprinted character, that, however, is counted in the JS string length)
        // so need a special processing for it, which is done in `ZeroWidthSpace`
        if (!context.isContent)
            output.write(<ZeroWidthSpace class="json-deep-diff-zero-width-space"></ZeroWidthSpace>)
    }


    get suppressSyncPoint () : boolean {
        return false
    }


    * renderContentGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        const hasInner              = this.entries.length > 0
        const suppressSyncPoints    = this.suppressSyncPoint

        this.renderCompositeHeader(output, context)

        if (context.isContent && hasInner) output.push(<serial-inner></serial-inner>)
        if (context.isExpander && hasInner) output.push(
            <serial-expander-inner>
                {
                    !suppressSyncPoints && <serial-expander-controls>
                        <serial-expander-line></serial-expander-line>
                        <serial-expander-opener></serial-expander-opener>
                        <serial-expander-closer></serial-expander-closer>
                    </serial-expander-controls>
                }
            </serial-expander-inner>
        )

        for (let i = 0; i < this.entries.length; i++) {
            const entry     = this.entries[ i ]

            // the entry element presents in all flows and this is what
            // is synchronizing the height across the streams
            output.push(<serial-entry></serial-entry>)

            if (!suppressSyncPoints) yield SerialRenderingSyncPoint.new({ type : 'before' })

            yield* this.renderChildGen(output, context, entry, i)

            // yielding the sync-point right _before_ the `pop` of the entry
            // entry is still a "currentElement" of the `output`
            // since `diff-entry` does not add any custom rendering,
            // all the entry content is available (only need to flush
            // the inline buffer of the entry's last child)
            if (!suppressSyncPoints) yield SerialRenderingSyncPoint.new({ type : 'after' })

            output.pop()
        }

        if (context.isContent && hasInner) output.pop()
        if (context.isExpander && hasInner) output.pop()

        this.renderCompositeFooter(output, context)
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : SerialRenderingContext) {
        // zero-width space, see the comment above
        if (!context.isContent)
            output.write(<ZeroWidthSpace class="json-deep-diff-zero-width-space"></ZeroWidthSpace>)
    }


    beforeRenderChildGen (
        output              : RenderingXmlFragment,
        context             : SerialRenderingContext,
        child               : Serial,
        index               : number
    )
    {
    }


    * renderChildGen (
        output              : RenderingXmlFragment,
        context             : SerialRenderingContext,
        child               : Serial,
        index               : number
    )
        : Generator<SerialRenderingSyncPoint>
    {
        this.beforeRenderChildGen(output, context, child, index)

        yield* child.renderGen(output, context)

        this.afterRenderChildGen(output, context, child, index)
    }


    afterRenderChildGen (
        output              : RenderingXmlFragment,
        context             : SerialRenderingContext,
        child               : Serial,
        index               : number
    )
    {
        if (context.isContent && this.needCommaAfterChild(child, index, context)) output.write(<NonPrettyPrintSpace>,</NonPrettyPrintSpace>)
    }



    needCommaAfterChild (
        child               : Serial,
        index               : number,
        context             : SerialRenderingContext
    )
        : boolean
    {
        return index !== this.entries.length - 1
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialCompositeEntry' })
export class SerialCompositeEntry extends Serial {
    serialization  : Serial        = undefined

    '--'

    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        yield* this.serialization.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialWrapper' })
export class SerialWrapper extends Serial {
    serialization   : Serial          = undefined


    template () : SerialElement {
        return SerialElement.new({ serialization : this })
    }


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        output.push(<serial-entry></serial-entry>)

        yield SerialRenderingSyncPoint.new({ type : 'before' })

        yield* this.serialization.renderGen(output, context)

        yield SerialRenderingSyncPoint.new({ type : 'after' })

        output.pop()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialArray' })
export class SerialArray extends SerialComposite {
    $value          : unknown[]

    // entries         : SerialArrayEntry[]

    length          : number            = undefined


    initialize (props : Partial<SerialArray>) {
        super.initialize(props)

        this.length     = this.value.length
    }


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) output.push(
            <serial-array id={ `serial-${ context.stream }-${ this.id }` }></serial-array>
        )

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) output.write('[')
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write(']')
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialObjectEntry' })
export class SerialObjectEntry extends SerialCompositeEntry {
    key             : string            = undefined

    '---'


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) {
            output.write(<serial-object-key>{ this.key }</serial-object-key>)
            output.write(': ')
        }

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialObject' })
export class SerialObject extends SerialComposite {
    $value              : object

    constructorName     : string                = undefined

    size                : number                = 0

    entries             : (SerialObjectEntry | SerialOutOfBreadth)[]


    initialize (props : Partial<SerialObject>) {
        super.initialize(props)

        this.constructorName    = constructorNameOf(this.value)
        this.size               = Object.keys(this.value).length
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) {
            const className     = this.constructorName

            if (className && className !== 'Object') output.write(className + ' ')

            output.write(
                this.entries.length > 0
                    ? <NonPrettyPrintSpace>{ '{' }</NonPrettyPrintSpace>
                    : '{'
            )
        }
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) output.write(
            this.entries.length > 0
                ? <NonPrettyPrintSpace trailing={ false }>{ '}' }</NonPrettyPrintSpace>
                : '}'
        )
    }


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) output.push(<serial-object id={ `serial-${ context.stream }-${ this.id }` }></serial-object>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialSet' })
export class SerialSet extends SerialComposite {
    $value          : Set<unknown>

    size            : number                    = undefined


    initialize (props : Partial<SerialSet>) {
        super.initialize(props)

        this.size       = this.value.size
    }


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) output.push(<serial-set id={ `serial-${ context.stream }-${ this.id }` }></serial-set>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) {
            output.write(`Set (${ this.size }) `)

            output.write(
                this.entries.length > 0
                    ? <NonPrettyPrintSpace>{ '{' }</NonPrettyPrintSpace>
                    : '{'
            )
        }
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) {
            output.write(
                this.entries.length > 0
                    ? <NonPrettyPrintSpace trailing={ false }>{ '}' }</NonPrettyPrintSpace>
                    : '}'
            )
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialMapEntry' })
export class SerialMapEntry extends SerialCompositeEntry {
    serialKeys          : Serial            = undefined

    '---'


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) {
            output.push(<serial-map-key></serial-map-key>)

            yield* this.serialKeys.renderGen(output, context)

            output.write(' => ')

            output.pop()
        }
        else {
            yield* this.serialKeys.renderGen(output, context)
        }

        yield* super.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialMap' })
export class SerialMap extends SerialComposite {
    $value          : Map<unknown, unknown>

    size            : number                    = undefined

    entries         : (SerialMapEntry | SerialOutOfBreadth)[]


    initialize (props : Partial<SerialMap>) {
        super.initialize(props)

        this.size       = this.value.size
    }


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) output.push(<serial-map id={ `serial-${ context.stream }-${ this.id }` }></serial-map>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    renderCompositeHeader (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeHeader(output, context)

        if (context.isContent) {
            output.write(`Map (${ this.size }) `)

            output.write(
                this.entries.length > 0
                    ? <NonPrettyPrintSpace>{ '{' }</NonPrettyPrintSpace>
                    : '{'
            )
        }
    }


    renderCompositeFooter (output : RenderingXmlFragment, context : SerialRenderingContext) {
        super.renderCompositeFooter(output, context)

        if (context.isContent) {
            output.write(
                this.entries.length > 0
                    ? <NonPrettyPrintSpace trailing={ false }>{ '}' }</NonPrettyPrintSpace>
                    : '}'
            )
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerialReference' })
export class SerialReference extends Serial {
    $value      : number


    * renderGen (output : RenderingXmlFragment, context : SerialRenderingContext) : Generator<SerialRenderingSyncPoint> {
        if (context.isContent) output.write(<span class="serial-reference">[Circular *{ this.value }]</span>)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialContentRendering extends Base {
    renderer        : XmlRendererSerial         = undefined

    maxWidth        : number                    = Number.MAX_SAFE_INTEGER

    stream          : RenderingStream           = undefined

    serialization   : Serial                    = undefined

    output          : RenderingXmlFragmentWithCanvas = undefined

    canvas          : RenderCanvas              = undefined


    initialize (props? : Partial<SerialContentRendering>) {
        super.initialize(props)

        this.canvas     = RenderCanvas.new({ maxWidth : this.maxWidth })

        this.output     = RenderingXmlFragmentWithCanvas.new({
            canvas          : this.canvas,
            renderer        : this.renderer
        })

        this.output.start(
            XmlElement.new({
                tagName         : 'div',
                attributes      : { class : 'serial-content-root' }
            })
        )
    }


    * render () : Generator<{ el : XmlElement, height : number }> {
        const output                                    = this.output
        const heightStart   : Map<XmlElement, number>   = new Map()

        const iterator      = this.serialization.renderGen(output, SerialRenderingContext.new({ stream : this.stream }))

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
@serializable({ id : 'SerialElement' })
export class SerialElement extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerialElement extends base {
        props           : XmlElement[ 'props' ] & {
            serialization       : SerialElement[ 'serialization' ]
        }

        tagName             : 'div'             = 'div'

        serialization       : SerialWrapper     = undefined


        renderContent (context : XmlRenderBlock) {
            const output    = RenderingXmlFragment.new()

            output.start(
                XmlElement.new({
                    tagName         : 'div',
                    attributes      : { class : 'serial-content-root' }
                })
            )

            const iterator      = this.serialization.renderGen(output, SerialRenderingContext.new({ stream : 'content' }))

            for (const v of iterator) {}

            output.currentElement.renderContent(context)
        }
    }
){}


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export class SerialPairElement extends Mixin(
//     [ XmlElement ],
//     (base : ClassUnion<typeof XmlElement>) =>
//
//     class SerialPairElement extends base {
//         props           : XmlElement[ 'props' ] & {
//             serialization       : SerialElement[ 'serialization' ]
//         }
//
//         tagName         : 'div'             = 'div'
//
//         serialization1  : Serial     = undefined
//
//         serialization2  : Serial     = undefined
//
//
//         renderContent (context : XmlRenderBlock) {
//             // // the wrapper for content in the middle stream ` |CONTENT| ` is 4 chars length
//             // const available     = context.maxWidth - (middleAreaMaxWidth + 4)
//             //
//             // const renderers     = [
//             //     SerialContentRendering.new({
//             //         stream      : 'left',
//             //         serialization  : this.serialization,
//             //         renderer    : context.renderer,
//             //         // extra 1 space because of the possible oddity of the `available` goes to the left region
//             //         maxWidth    : Math.round(available / 2)
//             //     }),
//             //     SerialContentRendering.new({
//             //         stream      : 'middle',
//             //         serialization  : this.serialization,
//             //         renderer    : context.renderer
//             //     }),
//             //     SerialContentRendering.new({
//             //         stream      : 'right',
//             //         serialization  : this.serialization,
//             //         renderer    : context.renderer,
//             //         maxWidth    : Math.floor(available / 2)
//             //     })
//             // ]
//             //
//             // const leftCanvas        = renderers[ 0 ].canvas
//             // const middleCanvas      = renderers[ 1 ].canvas
//             // const rightCanvas       = renderers[ 2 ].canvas
//             //
//             // // "pre-render" some content
//             // leftCanvas.writePlain('Received')
//             // // this write will set the minimum width for middle canvas to 1 char
//             // middleCanvas.writePlain(' ')
//             // rightCanvas.writePlain('Expected')
//             //
//             // renderers.forEach(renderer => {
//             //     renderer.canvas.newLine()
//             // })
//             //
//             // const iterators     = renderers.map(renderer => renderer.render())
//             //
//             // while (true) {
//             //     const iterations        = iterators.map(iterator => iterator.next())
//             //
//             //     if (iterations.every(iteration => iteration.done)) break
//             //
//             //     if (iterations.every(iteration => !iteration.done)) {
//             //         const maxHeight     = Math.max(iterations[ 0 ].value.height, iterations[ 2 ].value.height)
//             //
//             //         iterations.forEach((iteration, index) => {
//             //             // this comparison is only used for typing purposes
//             //             // (TS can't track the `every !done` assertion from above)
//             //             if (iteration.done === false) {
//             //                 const heightDiff    = maxHeight - iteration.value.height
//             //
//             //                 if (heightDiff > 0)
//             //                     renderers[ index ].output.write(
//             //                         Fitter.new({
//             //                             tagName : 'div',
//             //                             attributes : {
//             //                                 class   : 'json-deep-diff-fitter',
//             //                                 style   : `height: ${ 1.5 * heightDiff }em`
//             //                             },
//             //                             height      : heightDiff
//             //                         })
//             //                     )
//             //             }
//             //         })
//             //     } else
//             //         throw new Error("Elements flow de-synchronization")
//             // }
//             //
//             // const height            = leftCanvas.height
//             //
//             // if (renderers.some(renderer => renderer.canvas.height !== height)) throw new Error("Rendering flow de-synchronization")
//             //
//             // for (let i = 0; i < height; i++) {
//             //     const leftLine      = leftCanvas.canvas[ i ]
//             //     const middleLine    = middleCanvas.canvas[ i ]
//             //     const rightLine     = rightCanvas.canvas[ i ]
//             //
//             //     // TODO optimize the `toString` joining here, can push the line itself
//             //     context.writeStyledSameLineText(leftLine.toString(), leftLine.length)
//             //     const equalLengthRemainderLeft  = leftCanvas.maxWidthFact - leftLine.length
//             //     context.writeStyledSameLineText(' '.repeat(equalLengthRemainderLeft), equalLengthRemainderLeft)
//             //
//             //     const equalLengthRemainderMiddle = middleCanvas.maxWidthFact - middleLine.length
//             //
//             //     context.writeStyledSameLineText(' │', 2)
//             //     context.writeStyledSameLineText(' '.repeat(equalLengthRemainderMiddle), equalLengthRemainderMiddle)
//             //     context.writeStyledSameLineText(middleLine.toString(), middleLine.length)
//             //     context.writeStyledSameLineText('│ ', 2)
//             //
//             //     context.writeStyledSameLineText(rightLine.toString(), rightLine.length)
//             //     const equalLengthRemainderRight  = rightCanvas.maxWidthFact - rightLine.length
//             //     context.writeStyledSameLineText(' '.repeat(equalLengthRemainderRight), equalLengthRemainderRight)
//             //
//             //     if (i !== height - 1) context.write('\n')
//             // }
//         }
//     }
// ){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Fitter extends XmlElement {
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
export class NonPrettyPrintSpace extends XmlElement {
    props               : XmlElement[ 'props'] & {
        trailing?           : boolean
    }

    tagName             : 'span'            = 'span'


    renderContent (context : XmlRenderBlock) {
        const renderer  = context.renderer as XmlRendererSerial

        if (renderer.prettyPrint) {
            super.renderContent(context)
        }
        else if (this.getAttribute('trailing') ?? true) {
            super.renderContent(context)

            context.write(' ')
        }
        else {
            context.write(' ')

            super.renderContent(context)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const serializeAtomic = function (v : unknown) : string {
    const type      = typeOf(v)

    if (type === 'RegExp') {
        return String(v)
    }
    if (type === 'Symbol') {
        return String(v)
    }
    else if (v instanceof FuzzyMatcher) {
        return v.toString()
    }
    else if (isDate(v)) {
        return dateToString(v)
    }
    else if (isFunction(v)) {
        return `[${ type }]`
    }
    else if (v === undefined)
        return 'undefined'
    else
        return JSON.stringify(v)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const functionSources = (func : Function) : string => {
    const sources                       = func.toString().split('\n')

    let minCommonLeadingWhitespace      = Infinity

    sources.forEach((line, index) => {
        // ignore first line, which won't have the common leading whitespace
        if (index === 0) return

        const leadingWhitespaceMatch  = /^(\s*)/.exec(line)

        if (leadingWhitespaceMatch) {
            const leadingWhitespace   = leadingWhitespaceMatch[ 1 ]

            // ignore whitespace-only lines
            if (leadingWhitespace === line) return

            if (leadingWhitespace.length < minCommonLeadingWhitespace) minCommonLeadingWhitespace  = leadingWhitespace.length
        }
    })

    if (minCommonLeadingWhitespace < Infinity) sources.forEach((line, index) => {
        // ignore first line, which won't have the common leading whitespace
        if (index === 0) return

        sources[ index ]    = line.slice(minCommonLeadingWhitespace)
    })

    return sources.join('\n')
}


const prependZeros = (num : number) : string => {
    return num >= 10 ? String(num) : '0' + String(num)
}


export const dateToString = (date : Date) : string => {
    return `new Date("${ date.getFullYear() }/${ prependZeros(date.getMonth()) }/${ prependZeros(date.getDate()) } ${ prependZeros(date.getHours()) }:${ prependZeros(date.getMinutes()) }:${ prependZeros(date.getSeconds()) }.${ date.getMilliseconds() }")`
}
