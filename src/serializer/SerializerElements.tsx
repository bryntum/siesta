import { ClassUnion, Mixin } from "../class/Mixin.js"
import {
    RenderingFrameContent,
    RenderingFrameIndent,
    RenderingFrameOutdent,
    RenderingFrameSequence,
    RenderingFrameStartBlock
} from "../jsx/RenderingFrame.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRenderer } from "../jsx/XmlRenderer.js"
import { serializable } from "../serializable/Serializable.js"
import { isString } from "../util/Typeguards.js"


//---------------------------------------------------------------------------------------------------------------------
export class XmlRendererSerialization extends Mixin(
    [ XmlRenderer ],
    (base : ClassUnion<typeof XmlRenderer>) =>

    class XmlRendererSerialization extends base {
        prettyPrint                     : boolean       = false

        spaceBetweenElements            : boolean       = true

        spaceAfterOpeningBracketArray   : boolean       = false
        spaceAfterOpeningBracketObject  : boolean       = true
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export type SerializationChildNode = SerializationNumber | SerializationArray


@serializable()
export class Serialization extends XmlElement {
    tagName         : 'serialization'           = 'serialization'

    childNodes      : SerializationChildNode[]
}


//---------------------------------------------------------------------------------------------------------------------
export class SerializationReferenceable extends XmlElement {
    refId           : number        = undefined


    checkForReferenceId (renderer : XmlRendererSerialization, sequence : RenderingFrameSequence) {
        const refId     = this.getAttribute('refId')

        if (refId !== undefined) sequence.write(`<ref *${ refId }> `)
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationArray extends SerializationReferenceable {
    props           : {
        length          : number
    }

    length          : number            = undefined

    tagName         : 'array'           = 'array'

    childNodes      : SerializationChildNode[]


    renderSelf (renderer : XmlRendererSerialization, sequence : RenderingFrameSequence) {
        this.checkForReferenceId(renderer, sequence)

        sequence.write('[')

        renderer.prettyPrint && sequence.push(RenderingFrameIndent.new())

        super.renderSelf(renderer, sequence)

        renderer.prettyPrint && sequence.push(RenderingFrameOutdent.new())

        sequence.write(']')
    }


    renderChildren (renderer : XmlRendererSerialization, sequence : RenderingFrameSequence) {
        this.childNodes.forEach((child, index) => {
            if (index === 0)
                if (renderer.prettyPrint)
                    sequence.push(RenderingFrameStartBlock.new())
                else if (renderer.spaceAfterOpeningBracketArray)
                    sequence.write(' ')


            sequence.push(isString(child) ? RenderingFrameContent.new({ content : child }) : child.render(renderer))

            if (index !== this.childNodes.length - 1)
                sequence.write(renderer.prettyPrint ? ',\n' : renderer.spaceBetweenElements ? ', ' : ',')
            else
                sequence.write(renderer.prettyPrint ? '\n' : renderer.spaceAfterOpeningBracketArray ? ' ' : '')
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class SerializationNumber extends XmlElement {
    tagName         : 'number'          = 'number'

    childNodes      : [ string ]
}

