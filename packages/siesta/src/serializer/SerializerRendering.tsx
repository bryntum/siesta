import { ClassUnion, Mixin } from "../class/Mixin.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { XmlElement, XmlNode } from "../jsx/XmlElement.js"
import { XmlRenderer, XmlRenderingDynamicContext } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { isString } from "../util/Typeguards.js"
import { SerializerXml } from "./SerializerXml.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRendererSerialization extends Mixin(
    [ XmlRenderer ],
    (base : ClassUnion<typeof XmlRenderer>) =>

    class XmlRendererSerialization extends base {
        prettyPrint                     : boolean       = false

        spaceBetweenElements            : boolean       = true

        spaceAfterOpeningBracketArray   : boolean       = false
        spaceAfterOpeningBracketObject  : boolean       = true

        atomicElementNodes              : Set<string>   = new Set([
            'boolean', 'number', 'string', 'date', 'regexp', 'symbol', 'function', 'special'
        ])


        printValue (value : unknown, textBlock? : Partial<TextBlock>, serializationProps? : Partial<SerializerXml>) : string {
            return this.render(SerializerXml.serialize(value, serializationProps), TextBlock.maybeNew(textBlock))
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type SerializationChildNode = XmlElement


@serializable({ id : 'Serialization' })
export class Serialization extends XmlElement {
    tagName         : 'serialization'           = 'serialization'

    childNodes      : [ SerializationChildNode ]
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerializationReferenceable extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerializationReferenceable extends base {
        props   : XmlElement[ 'props' ] & {
            refId?          : number
        }


        getRefId (context : XmlRenderingDynamicContext) : number {
            return this.getAttribute('refId')
        }


        beforeRenderChildren (renderer : XmlRendererSerialization, output : TextBlock, context : XmlRenderingDynamicContext) {
            const refId     = this.getRefId(context)

            if (refId !== undefined) output.push(`<ref *${ refId }> `)

            super.beforeRenderChildren(renderer, output, context)
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerializationComposite extends Mixin(
    [ SerializationReferenceable ],
    (base : ClassUnion<typeof SerializationReferenceable>) =>

    class SerializationComposite extends base {

        getSpaceAfterOpeningBracket (renderer : XmlRendererSerialization) : boolean {
            throw new Error("Abstract method")
        }

        getSpaceBetweenElements (renderer : XmlRendererSerialization) : boolean {
            return renderer.spaceBetweenElements
        }


        renderCompositeHeader (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
        }


        renderCompositeFooter (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
        }


        beforeRenderChildren (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            super.beforeRenderChildren(renderer, output, context)

            this.renderCompositeHeader(renderer, output, context)

            renderer.prettyPrint && output.indent()
        }


        afterRenderChildren (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            renderer.prettyPrint && output.outdent()

            this.renderCompositeFooter(renderer, output, context)
        }


        beforeRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            if (index === 0)
                if (renderer.prettyPrint)
                    output.write('\n')
                else if (this.getSpaceAfterOpeningBracket(renderer))
                    output.write(' ')
        }


        needCommaAfterChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            context             : XmlRenderingDynamicContext
        )
            : boolean
        {
            return index !== this.childNodes.length - 1
        }


        afterRenderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            if (this.needCommaAfterChild(child, index, renderer, context))
                output.write(renderer.prettyPrint ? ',\n' : this.getSpaceBetweenElements(renderer) ? ', ' : ',')
            else
                output.write(renderer.prettyPrint ? '\n' : this.getSpaceAfterOpeningBracket(renderer) ? ' ' : '')
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationArray' })
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
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write('[')
        }


        renderCompositeFooter (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write(']')
        }


        renderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            if (!isString(child) && child.tagName.toLowerCase() === 'out_of_wide') {
                output.write(`... (${ this.getAttribute('length') - this.childNodes.length + 1 } more)`)
            } else {
                super.renderChild(child, index, renderer, output, context)
            }
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationObject' })
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


        getConstructorName (
            renderer    : XmlRendererSerialization,
            context     : XmlRenderingDynamicContext
        ) {
            return this.getAttribute('constructorName')
        }


        renderCompositeHeader (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            const className     = this.getConstructorName(renderer, context)

            if (className && className !== 'Object') output.write(className + ' ')

            output.write('{')
        }


        renderCompositeFooter (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write('}')
        }


        renderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            if (isString(child)) {
                super.renderChild(child, index, renderer, output, context)
            }
            else if (child.tagName === 'out_of_wide') {
                output.write(`... (${ this.getAttribute('size') - this.childNodes.length + 1 } more)`)
            } else {
                super.renderChild(child, index, renderer, output, context)
            }
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationObjectEntry' })
export class SerializationObjectEntry extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerializationObjectEntry extends base {
        tagName         : string                = 'object_entry'

        childNodes      : [ SerializationChildNode, SerializationChildNode ]


        renderSelf (
            renderer        : XmlRendererSerialization,
            output          : TextBlock,
            context         : XmlRenderingDynamicContext
        ) {
            const keyEl         = this.childNodes[ 0 ]
            const valueEl       = this.childNodes[ 1 ]

            // keyEl.renderToTextBlock(renderer, output, context)
            this.renderChildInner(keyEl, 0, renderer, output, context)

            output.write(': ')

            const valueIsAtomic     = this.valueIsAtomic(valueEl, renderer, context)

            if (valueIsAtomic && renderer.prettyPrint) output.indent()

            // valueEl.renderToTextBlock(renderer, output, context)
            this.renderChildInner(valueEl, 1, renderer, output, context)

            if (valueIsAtomic && renderer.prettyPrint) output.outdent()
        }


        valueIsAtomic (valueEl : XmlElement, renderer : XmlRendererSerialization, context : XmlRenderingDynamicContext) : boolean {
            return renderer.atomicElementNodes.has(valueEl.tagName)
        }
    }
) {}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationSet' })
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


        getSize (context : XmlRenderingDynamicContext) : number {
            return this.getAttribute('size')
        }


        renderCompositeHeader (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write(`Set (${ this.getSize(context) }) {`)
        }


        renderCompositeFooter (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write('}')
        }


        renderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            if (!isString(child) && child.tagName === 'out_of_wide') {
                output.write(`...`)
            } else {
                super.renderChild(child, index, renderer, output, context)
            }
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationMap' })
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


        getSize (context : XmlRenderingDynamicContext) : number {
            return this.getAttribute('size')
        }


        renderCompositeHeader (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write(`Map (${ this.getSize(context) }) {`)
        }


        renderCompositeFooter (
            renderer    : XmlRendererSerialization,
            output      : TextBlock,
            context     : XmlRenderingDynamicContext
        ) {
            output.write('}')
        }


        renderChild (
            child               : XmlNode,
            index               : number,
            renderer            : XmlRendererSerialization,
            output              : TextBlock,
            context             : XmlRenderingDynamicContext
        ) {
            if (isString(child)) {
                super.renderChild(child, index, renderer, output, context)
            }
            else if (child.tagName === 'out_of_wide') {
                output.write(`...`)
            } else {
                super.renderChild(child, index, renderer, output, context)
            }
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationMapEntry' })
export class SerializationMapEntry extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerializationMapEntry extends base {
        tagName         : string                = 'map_entry'

        childNodes      : [ SerializationChildNode, SerializationChildNode ]


        renderSelf (
            renderer        : XmlRendererSerialization,
            output          : TextBlock,
            context         : XmlRenderingDynamicContext
        ) {
            const keyEl         = this.childNodes[ 0 ] as XmlElement
            const valueEl       = this.childNodes[ 1 ] as XmlElement

            keyEl.renderToTextBlock(renderer, output, context)

            output.write(' => ')

            const valueIsAtomic     = this.valueIsAtomic(renderer, context)

            if (valueIsAtomic && renderer.prettyPrint) output.indent()

            valueEl.renderToTextBlock(renderer, output, context)

            if (valueIsAtomic && renderer.prettyPrint) output.outdent()
        }


        valueIsAtomic (renderer : XmlRendererSerialization, context : XmlRenderingDynamicContext) : boolean {
            const valueEl       = this.childNodes[ 1 ] as XmlElement

            return renderer.atomicElementNodes.has(valueEl.tagName.toLowerCase())
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationOutOfDepth' })
export class SerializationOutOfDepth extends Mixin(
    [ SerializationReferenceable ],
    (base : ClassUnion<typeof SerializationReferenceable>) =>

    class SerializationOutOfDepth extends base {
        props           : SerializationReferenceable[ 'props' ] & {
            constructorName?        : string
        }

        tagName         : string            = 'out_of_depth'


        renderSelf (
            renderer        : XmlRenderer,
            output          : TextBlock,
            context         : XmlRenderingDynamicContext
        ) {
            output.write(`▼ ${ this.getAttribute('constructorName') ?? '' } {…}`)
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'SerializationReference' })
export class SerializationReference extends Mixin(
    [ XmlElement ],
    (base : ClassUnion<typeof XmlElement>) =>

    class SerializationReference extends base {
        props           : XmlElement[ 'props' ] & {
            refId?        : number
        }

        tagName         : string            = 'reference'


        renderSelf (
            renderer        : XmlRenderer,
            output          : TextBlock,
            context         : XmlRenderingDynamicContext
        ) {
            output.write(`[Circular *${ this.getAttribute('refId') }]`)
        }
    }
){}
