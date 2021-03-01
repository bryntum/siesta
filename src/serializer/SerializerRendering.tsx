import { ClassUnion, Mixin } from "../class/Mixin.js"
import { RenderingFrameIndent, RenderingFrameOutdent, RenderingFrameSequence, RenderingFrameOpenBlock } from "../jsx/RenderingFrame.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { SerializerXml } from "./SerializerXml.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererSerialization extends Mixin(
    [ XmlRenderer ],
    (base : ClassUnion<typeof XmlRenderer>) =>

    class XmlRendererSerialization extends base {
        prettyPrint                     : boolean       = false

        spaceBetweenElements            : boolean       = true

        spaceAfterOpeningBracketArray   : boolean       = false
        spaceAfterOpeningBracketObject  : boolean       = true

        leafNodes               : Set<string>   = new Set([
            'boolean', 'number', 'string', 'date', 'regexp', 'symbol', 'function', 'special'
        ])


        printValue (value : unknown, textBlock? : Partial<TextBlock>, serilizationProps? : Partial<SerializerXml>) : string {
            return this.renderToString(SerializerXml.serialize(value, serilizationProps), TextBlock.maybeNew(textBlock))
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export type SerializationChildNode = SerializationArray


@serializable()
export class Serialization extends XmlElement {
    tagName         : 'serialization'           = 'serialization'

    childNodes      : SerializationChildNode[]
}

//---------------------------------------------------------------------------------------------------------------------
export class SerializationReferenceable extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerializationReferenceable extends base {
        props   : XmlElement[ 'props' ] & {
            refId?          : number
        }


        beforeRenderChildren (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            const refId     = this.getAttribute('refId')

            if (refId !== undefined) sequence.write(`<ref *${ refId }> `)

            super.beforeRenderChildren(renderer, sequence, parentContexts, ownContext)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class SerializationComposite extends Mixin(
    [ SerializationReferenceable ],
    (base : ClassUnion<typeof SerializationReferenceable>) =>

    class SerializationComposite extends base {

        getSpaceAfterOpeningBracket (renderer : XmlRendererSerialization) : boolean {
            throw new Error("Implement me")
        }

        getSpaceBetweenElements (renderer : XmlRendererSerialization) : boolean {
            return renderer.spaceBetweenElements
        }


        renderCompositeHeader (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
        }


        renderCompositeFooter (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
        }


        beforeRenderChildren (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            super.beforeRenderChildren(renderer, sequence, parentContexts, ownContext)

            this.renderCompositeHeader(renderer, sequence, parentContexts, ownContext)

            renderer.prettyPrint && sequence.push(RenderingFrameIndent.new())
        }


        afterRenderChildren (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            renderer.prettyPrint && sequence.push(RenderingFrameOutdent.new())

            this.renderCompositeFooter(renderer, sequence, parentContexts, ownContext)
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            if (index === 0)
                if (renderer.prettyPrint)
                    sequence.push(RenderingFrameOpenBlock.new())
                else if (this.getSpaceAfterOpeningBracket(renderer))
                    sequence.write(' ')
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            if (index !== this.childNodes.length - 1)
                sequence.write(renderer.prettyPrint ? ',\n' : this.getSpaceBetweenElements(renderer) ? ', ' : ',')
            else
                sequence.write(renderer.prettyPrint ? '\n' : this.getSpaceAfterOpeningBracket(renderer) ? ' ' : '')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationArray extends Mixin(
    [ SerializationComposite ],
    (base : ClassUnion<typeof SerializationComposite>) =>

    class SerializationArray extends base {
        props           : SerializationComposite[ 'props' ] & {
            length?         : number
        }

        tagName         : string            = 'array'


        getSpaceAfterOpeningBracket (renderer : XmlRendererSerialization) : boolean {
            return renderer.spaceAfterOpeningBracketArray
        }


        renderCompositeHeader (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write('[')
        }


        renderCompositeFooter (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write(']')
        }


        renderChild (
            child               : XmlElement,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            if (child.tagName === 'out_of_wide') {
                sequence.write(`... (${ this.getAttribute('length') - this.childNodes.length + 1 } more)`)
            } else {
                super.renderChild(child, index, renderer, sequence, parentContexts, ownContext)
            }
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationObject extends Mixin(
    [ SerializationComposite ],
    (base : ClassUnion<typeof SerializationComposite>) =>

    class SerializationObject extends base {
        props           : SerializationComposite[ 'props' ] & {
            constructorName?        : string,
            size?                   : number
        }

        tagName             : string            = 'object'


        getSpaceAfterOpeningBracket (renderer : XmlRendererSerialization) : boolean {
            return renderer.spaceAfterOpeningBracketObject
        }


        renderCompositeHeader (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            const className     = this.getAttribute('constructorName')

            if (className && className !== 'Object') sequence.write(className + ' ')

            sequence.write('{')
        }


        renderCompositeFooter (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write('}')
        }


        renderChild (
            child               : XmlElement,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            if (child.tagName === 'out_of_wide') {
                sequence.write(`... (${ this.getAttribute('size') - this.childNodes.length + 1 } more)`)
            } else {
                const keyEl         = child.childNodes[ 0 ] as XmlElement
                const valueEl       = child.childNodes[ 1 ] as XmlElement

                sequence.push(keyEl.render(renderer, [ ...parentContexts, ownContext ])[ 0 ])

                sequence.write(': ')

                const valueIsAtomic     = renderer.leafNodes.has((valueEl.childNodes[ 0 ] as XmlElement).tagName)

                if (valueIsAtomic && renderer.prettyPrint) sequence.push(RenderingFrameIndent.new())

                sequence.push(valueEl.render(renderer, [ ...parentContexts, ownContext ])[ 0 ])

                if (valueIsAtomic && renderer.prettyPrint) sequence.push(RenderingFrameOutdent.new())
            }
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationSet extends Mixin(
    [ SerializationComposite ],
    (base : ClassUnion<typeof SerializationComposite>) =>

    class SerializationSet extends base {
        props           : SerializationComposite[ 'props' ] & {
            size?           : number
        }

        tagName         : string            = 'set'


        getSpaceAfterOpeningBracket (renderer : XmlRendererSerialization) : boolean {
            return renderer.spaceAfterOpeningBracketObject
        }


        renderCompositeHeader (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write(`Set (${ this.getAttribute('size') }) {`)
        }


        renderCompositeFooter (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write('}')
        }


        renderChild (
            child               : XmlElement,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            if (child.tagName === 'out_of_wide') {
                sequence.write(`...`)
            } else {
                super.renderChild(child, index, renderer, sequence, parentContexts, ownContext)
            }
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationMap extends Mixin(
    [ SerializationComposite ],
    (base : ClassUnion<typeof SerializationComposite>) =>

    class SerializationMap extends base {
        props           : SerializationComposite[ 'props' ] & {
            size?           : number
        }

        tagName         : string            = 'map'


        getSpaceAfterOpeningBracket (renderer : XmlRendererSerialization) : boolean {
            return renderer.spaceAfterOpeningBracketObject
        }


        renderCompositeHeader (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write(`Map (${ this.getAttribute('size') }) {`)
        }


        renderCompositeFooter (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write('}')
        }


        renderChild (
            child               : XmlElement,
            index               : number,
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            if (child.tagName === 'out_of_wide') {
                sequence.write(`...`)
            } else {
                const keyEl         = child.childNodes[ 0 ] as XmlElement
                const valueEl       = child.childNodes[ 1 ] as XmlElement

                sequence.push(keyEl.render(renderer, [ ...parentContexts, ownContext ])[ 0 ])

                sequence.write(' => ')

                const valueIsAtomic     = renderer.leafNodes.has((valueEl.childNodes[ 0 ] as XmlElement).tagName)

                if (valueIsAtomic && renderer.prettyPrint) sequence.push(RenderingFrameIndent.new())

                sequence.push(valueEl.render(renderer, [ ...parentContexts, ownContext ])[ 0 ])

                if (valueIsAtomic && renderer.prettyPrint) sequence.push(RenderingFrameOutdent.new())
            }
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationOutOfDepth extends Mixin(
    [ SerializationReferenceable ],
    (base : ClassUnion<typeof SerializationReferenceable>) =>

    class SerializationOutOfDepth extends base {
        props           : SerializationReferenceable[ 'props' ] & {
            constructorName?        : string
        }

        tagName         : string            = 'out_of_depth'


        renderSelf (
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write(`▼ ${ this.getAttribute('constructorName') ?? '' } { ... }`)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationReference extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerializationReference extends base {
        props           : XmlElement[ 'props' ] & {
            refId?        : number
        }

        tagName         : string            = 'reference'


        renderSelf (
            renderer            : XmlRenderer,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            sequence.write(`[Circular *${ this.getAttribute('refId') }]`)
        }
    }
){}
