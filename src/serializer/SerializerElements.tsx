import { ClassUnion, Mixin } from "../class/Mixin.js"
import { RenderingFrameIndent, RenderingFrameOutdent, RenderingFrameSequence, RenderingFrameStartBlock } from "../jsx/RenderingFrame.js"
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


        print (value : unknown, textBlock? : Partial<TextBlock>, serilizationProps? : Partial<SerializerXml>) : string {
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

        checkForReferenceId (renderer : XmlRendererSerialization, sequence : RenderingFrameSequence) {
            const refId     = this.getAttribute('refId')

            if (refId !== undefined) sequence.write(`<ref *${ refId }> `)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationArray extends Mixin(
    [ SerializationReferenceable ],
    (base : ClassUnion<typeof SerializationReferenceable>) =>

    class SerializationArray extends base {
        props           : SerializationReferenceable[ 'props' ] & {
            length?         : number
        }

        tagName         : string            = 'array'


        renderSelf (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            this.checkForReferenceId(renderer, sequence)

            sequence.write('[')

            renderer.prettyPrint && sequence.push(RenderingFrameIndent.new())

            super.renderSelf(renderer, sequence, parentContexts, ownContext)

            renderer.prettyPrint && sequence.push(RenderingFrameOutdent.new())

            sequence.write(']')
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
                    sequence.push(RenderingFrameStartBlock.new())
                else if (renderer.spaceAfterOpeningBracketArray)
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
                sequence.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
            else
                sequence.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationObject extends Mixin(
    [ SerializationReferenceable ],
    (base : ClassUnion<typeof SerializationReferenceable>) =>

    class SerializationObject extends base {
        props           : SerializationReferenceable[ 'props' ] & {
            constructorName?        : string,
            size?                   : number
        }

        tagName             : string            = 'object'


        renderSelf (
            renderer            : XmlRendererSerialization,
            sequence            : RenderingFrameSequence,
            parentContexts      : XmlRenderingDynamicContext[],
            ownContext          : XmlRenderingDynamicContext,
        ) {
            const className     = this.getAttribute('constructorName')

            if (className && className !== 'Object') sequence.write(className + ' ')

            this.checkForReferenceId(renderer, sequence)

            sequence.write('{')

            renderer.prettyPrint && sequence.push(RenderingFrameIndent.new())

            super.renderSelf(renderer, sequence, parentContexts, ownContext)

            renderer.prettyPrint && sequence.push(RenderingFrameOutdent.new())

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
            if (index === 0)
                if (renderer.prettyPrint)
                    sequence.push(RenderingFrameStartBlock.new())
                else if (renderer.spaceAfterOpeningBracketObject)
                    sequence.write(' ')


            const keyEl         = child.childNodes[ 0 ] as XmlElement
            const valueEl       = child.childNodes[ 1 ] as XmlElement

            sequence.push(keyEl.render(renderer, [ ...parentContexts, ownContext ])[ 0 ])

            sequence.write(': ')

            const valueIsAtomic     = renderer.leafNodes.has((valueEl.childNodes[ 0 ] as XmlElement).tagName)

            if (valueIsAtomic && renderer.prettyPrint) sequence.push(RenderingFrameIndent.new())

            sequence.push(valueEl.render(renderer, [ ...parentContexts, ownContext ])[ 0 ])

            if (valueIsAtomic && renderer.prettyPrint) sequence.push(RenderingFrameOutdent.new())


            if (index !== this.childNodes.length - 1)
                sequence.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
            else
                sequence.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketObject ? ' ' : '')
        }
    }
){}
