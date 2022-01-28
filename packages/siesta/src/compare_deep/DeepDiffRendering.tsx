import { CI } from "chained-iterator"
import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { exclude, Serializable, serializable } from "typescript-serializable-mixin"
import { RenderingXmlFragment } from "../jsx/RenderBlock.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { luid, LUID } from "../siesta/common/LUID.js"
import { ArbitraryObjectKey } from "../util/Helpers.js"
import { Missing } from "./DeepDiff.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class MissingValue extends XmlElement {
    tagName             : 'missing_value'           = 'missing_value'
}


export type DifferenceRenderingStream   = 'expander' | 'left' | 'middle' | 'right'

export class DifferenceRenderingContext extends Base {
    stream          : DifferenceRenderingStream     = undefined


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

        same            : boolean                   = false

        type            : DifferenceType            = undefined


        initialize (props : Partial<Difference>) {
            super.initialize(props)

            if (this.type === undefined) {
                const has1  = this.value1 !== Missing
                const has2  = this.value2 !== Missing

                this.type   = has1 && has2 ? 'both' : has1 ? 'onlyIn1' : 'onlyIn2'
            }
        }


        excludeValue (valueProp : 'value1' | 'value2') {
            this[ valueProp ]   = Missing

            this.same           = false
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
        return (difference1.same ? 0 : 1) - (difference2.same ? 0 : 1)
    else if (type1 === 'onlyIn1' && type2 === 'onlyIn2')
        return -1
    else if (type1 === 'onlyIn2' && type2 === 'onlyIn1')
        return 1
    else
        return 0
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

    content1        : string            = undefined
    content2        : string            = undefined

    typeOf1         : string            = undefined
    typeOf2         : string            = undefined


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        if (valueProp === 'value1')
            this.content1   = undefined
        else
            this.content2   = undefined
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        const stream        = context.stream

        if (context.isContent) {
            output.write(<diff-atomic same={ this.same } type={ this.type } class={ stream === 'left' ? this.typeOf1 : this.typeOf2 }>
                {
                    stream === 'left'
                        ? this.content1 ?? <MissingValue></MissingValue>
                        : this.content2 ?? <MissingValue></MissingValue>
                }
            </diff-atomic>)
        }
        else if (stream === 'expander') {
        }
        else if (stream === 'middle') {

        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceReferenceable extends Difference {
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
        const circularId    = this.getCircularId(context)

        if (circularId !== undefined)
            output.write(<span class="circular-id">{ `<circular *${ circularId }> ` }</span>)
        else {
            const refId     = this.getRefId(context)

            if (refId !== undefined) output.write(<span class="reference-id">{ `<ref *${ refId }> ` }</span>)
        }
    }


    getCircularId (context : DifferenceRenderingContext) : number {
        return context.stream === 'left' ? this.circular1 : this.circular2
    }


    getRefId (context : DifferenceRenderingContext) : number {
        return context.stream === 'left' ? this.refId1 : this.refId2
    }


    * beforeRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) this.renderReferenceablePrefix(output, context)

        yield* super.beforeRenderContentGen(output, context)
    }
}


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export class DifferenceReferenceableAtomic extends Mixin(
//     // unordered mixins combination! order of clashing methods is not defined
//     [ DifferenceReferenceable, DifferenceAtomic ],
//     (base : ClassUnion<typeof DifferenceReferenceable, typeof DifferenceAtomic>) =>
//
//     class DifferenceReferenceableAtomic extends base {
//
//         // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
//         //     return <DifferenceTemplateReferenceableAtomic
//         //         type={ this.type } same={ this.same } refId={ this.refId1 } refId2={ this.refId2 }
//         //         circular1 = { this.circular1 } circular2 = { this.circular2 }
//         //     >
//         //         { this.value1 === Missing ? <MissingValue></MissingValue> : diffState[ 0 ].serialize(this.value1) }
//         //         { this.value2 === Missing ? <MissingValue></MissingValue> : diffState[ 1 ].serialize(this.value2) }
//         //     </DifferenceTemplateReferenceableAtomic>
//         // }
//     }
// ){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceComposite extends DifferenceReferenceable {

    entries         : DifferenceRendering[]         = []


    // separator
    dummyProp

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isExpander) {
            output.push(
                <diff-expander id={ `${ context.stream }-${ this.id }` }>
                    <diff-expander-line></diff-expander-line>
                    <diff-expander-controls>
                        <diff-expander-opener></diff-expander-opener>
                        <diff-expander-closer></diff-expander-closer>
                    </diff-expander-controls>
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


    * renderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-inner class="indented"></diff-inner>)

        for (let i = 0; i < this.entries.length; i++) {
            const child     = this.entries[ i ]

            yield* this.beforeRenderChildGen(output, context, child, i)

            // the entry element presents in all flows and this is what
            // is synchronizing the height across the streams
            output.push(<diff-entry></diff-entry>)

            yield DifferenceRenderingSyncPoint.new({ type : 'before' })

            yield* this.renderChildGen(output, context, child, i)

            output.pop()

            yield DifferenceRenderingSyncPoint.new({ type : 'after' })

            yield* this.afterRenderChildGen(output, context, child, i)
        }

        if (context.isContent) output.pop()
    }


    * beforeRenderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceRendering,
        index               : number
    )
        : Generator<DifferenceRenderingSyncPoint>
    {
    }


    * renderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceRendering,
        index               : number
    )
        : Generator<DifferenceRenderingSyncPoint>
    {
        yield* child.renderGen(output, context)
    }


    * afterRenderChildGen (
        output              : RenderingXmlFragment,
        context             : DifferenceRenderingContext,
        child               : DifferenceRendering,
        index               : number
    )
        : Generator<DifferenceRenderingSyncPoint>
    {
    }


    getOnlyIn2Size () : number {
        throw new Error('Abstract method')
    }


    // needCommaAfterChild (
    //     child               : Child,
    //     index               : number,
    //     stream              : DifferenceRenderingContext
    // )
    //     : boolean
    // {
    //     const nextChild     = this.getChild(index + 1)
    //
    //     if (
    //         child.isMissingIn(stream)
    //         ||
    //         nextChild === undefined
    //         ||
    //         stream === 'left' && nextChild.isMissingIn(stream)
    //         ||
    //         stream === 'right' && nextChild.isMissingIn(stream) && this.getOnlyIn2Size() === 0
    //     ) {
    //         return false
    //     } else {
    //         return super.needCommaAfterChild(child, index, renderer, context)
    //     }
    // }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceArrayEntry extends DifferenceRendering {
    index       : number            = undefined
    difference  : Difference        = undefined

    zz

    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isMiddle) output.write(String(this.index))

        yield* this.difference.renderGen(output, context)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DifferenceArray extends DifferenceComposite {
    value1          : unknown[]
    value2          : unknown[]

    same            : boolean           = true

    entries         : DifferenceArrayEntry[]

    // comparisons     : { index : number, difference : Difference }[]      = []


    // forEachChild (func : (child : { index : number, difference : Difference }, index : number) => any) {
    //     this.comparisons.forEach(func)
    // }
    //
    //
    // getChild (index : number) : { index : number; difference : Difference } {
    //     return this.comparisons[ index ]
    // }


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.entries.forEach(comparison => comparison.difference.excludeValue(valueProp))
    }


    addComparison (index : number, difference : Difference) {
        this.entries.push(DifferenceArrayEntry.new({ index, difference }))

        if (this.same && !difference.same) this.same = false
    }


    * renderGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        if (context.isContent) output.push(<diff-array id={ `${ context.stream }-${ this.id }` } same={ this.same } type={ this.type }></diff-array>)

        yield* super.renderGen(output, context)

        if (context.isContent) output.pop()
    }


    * beforeRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        yield* super.beforeRenderContentGen(output, context)

        if (context.isContent) output.write('[')

        // zero-width space
        if (context.isExpander || context.isMiddle) output.write(String.fromCharCode(0x200B))
    }


    * afterRenderContentGen (output : RenderingXmlFragment, context : DifferenceRenderingContext) : Generator<DifferenceRenderingSyncPoint> {
        yield* super.afterRenderContentGen(output, context)

        if (context.isContent) output.write(']')

        // zero-width space
        if (context.isExpander || context.isMiddle) output.write(String.fromCharCode(0x200B))
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
export class DifferenceObject extends DifferenceReferenceable {
    value1          : object | Missing
    value2          : object | Missing

    onlyIn2Size     : number                    = 0

    same            : boolean                   = true

    comparisons     : { key : ArbitraryObjectKey, difference : Difference }[]  = []


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.comparisons.forEach(comparison => comparison.difference.excludeValue(valueProp))
    }


    addComparison (key : ArbitraryObjectKey, difference : Difference) {
        this.comparisons.push({ key, difference })

        if (this.same && !difference.same) this.same = false
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
export class DifferenceSet extends DifferenceReferenceable {
    value1          : Set<unknown>
    value2          : Set<unknown>

    onlyIn2Size     : number                    = 0

    same            : boolean                   = true

    comparisons     : { difference : Difference }[]     = []


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.comparisons.forEach(comparison => comparison.difference.excludeValue(valueProp))
    }


    addComparison (difference : Difference) {
        this.comparisons.push({ difference })

        if (this.same && !difference.same) this.same = false
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
export class DifferenceMap extends DifferenceReferenceable {
    value1          : Map<unknown, unknown>
    value2          : Map<unknown, unknown>

    onlyIn2Size     : number                    = 0

    same            : boolean                   = true

    comparisons     : { differenceKeys : Difference, differenceValues : Difference }[]     = []


    excludeValue (valueProp : 'value1' | 'value2') {
        super.excludeValue(valueProp)

        this.comparisons.forEach(comparison => {
            comparison.differenceKeys.excludeValue(valueProp)
            comparison.differenceValues.excludeValue(valueProp)
        })
    }


    addComparison (differenceKeys : Difference, differenceValues : Difference) {
        this.comparisons.push({ differenceKeys, differenceValues })

        if (this.same && (!differenceKeys.same || !differenceValues.same)) this.same = false
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
    value1      : number
    value2      : number


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


    // templateInner (serializerConfig : Partial<SerializerXml>, diffState : [ SerializerXml, SerializerXml ]) : XmlElement {
    //     return <DifferenceTemplateHeterogeneous type={ this.type } same={ this.same }>
    //         { this.value1 !== Missing ? this.value1.templateInner(serializerConfig, diffState) : <MissingValue></MissingValue> }
    //         { this.value2 !== Missing ? this.value2.templateInner(serializerConfig, diffState) : <MissingValue></MissingValue> }
    //     </DifferenceTemplateHeterogeneous>
    // }
}
