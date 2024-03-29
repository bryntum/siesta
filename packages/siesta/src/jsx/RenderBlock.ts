import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { lastElement, saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Colorer } from "./Colorer.js"
import { XmlElement, XmlNode } from "./XmlElement.js"
import { XmlRendererStreaming } from "./XmlRenderer.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class RenderingXmlFragment extends Base {

    currentElement      : XmlElement    = undefined


    start (el : XmlElement) {
        if (this.currentElement) throw new Error("Overwriting the current element")

        this.currentElement     = el
    }


    write (el : XmlNode) {
        this.currentElement.appendChild(el)
    }


    push (el : XmlElement) {
        this.write(el)

        this.currentElement     = el
    }


    pop () {
        this.currentElement     = this.currentElement.parent
    }


    flush () : XmlElement {
        const res               = this.currentElement

        this.currentElement     = undefined

        return res
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class RenderingXmlFragmentWithCanvas extends RenderingXmlFragment {
    renderer        : XmlRendererStreaming              = undefined

    canvas          : RenderCanvas                      = undefined

    blockByElement  : Map<XmlElement, XmlRenderBlock>   = new Map()


    start (el : XmlElement) {
        if (this.renderer.getDisplayType(el) !== 'block') throw new Error("Should always start with block-level element")

        super.start(el)

        this.blockByElement.set(el, XmlRenderBlock.new({
            canvas      : this.canvas,
            renderer    : this.renderer,
            element     : el,
            maxWidth    : this.canvas.maxWidth
        }))
    }


    write (childNode : XmlNode) {
        // it is more or less safe to ignore missing block here - if the element is rendered as being child
        // another element, in the `childNode.startStreamingRendering(childBlock)` line below,
        // the rendering will happen outside this context and no block will be saved for it
        // see the comment below too
        this.finalizeLastChildOfCurrent(true)

        super.write(childNode)

        const currentElement    = this.currentElement
        const index             = this.currentElement.childNodes.length

        const currentBlock      = this.blockByElement.get(currentElement)

        currentElement.beforeRenderChildStreaming(currentBlock, childNode, index)

        if (isString(childNode))
            currentBlock.write(childNode)
        else {
            const childBlock    = currentBlock.deriveChildBlock(childNode, index)

            this.blockByElement.set(childNode, childBlock)

            // this will render any existing children of the newly added `childNode`
            // rendering will happen outside this class context, so no blocks will be
            // registered for them - thus the `true` argument for `finalizeLastChildOfCurrent` call above
            childNode.startStreamingRendering(childBlock)
        }
    }


    finalizeRendering (el : XmlElement, ignoreMissing : boolean = false) {
        const renderBlock       = this.blockByElement.get(el)

        if (renderBlock || !ignoreMissing) el.finishStreamingRendering(renderBlock)
    }


    finalizeLastChildOfCurrent (ignoreMissing : boolean) {
        const lastChildOfCurrent    = lastElement(this.currentElement.childNodes)

        if (lastChildOfCurrent && !isString(lastChildOfCurrent)) this.finalizeRendering(lastChildOfCurrent, ignoreMissing)
    }


    pop () {
        this.finalizeLastChildOfCurrent(false)
        this.finalizeRendering(this.currentElement)

        super.pop()

        // NOTE - only 1 top-level `pop` is allowed
        // finalize rendering of the starting element
        if (!this.currentElement.parent) this.finalizeRendering(this.currentElement)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// the string, colored with ANSI escape sequences, may have different "actual" and "printable" lengths
// so we need to track the "printable" length separately
export class Line extends Base {
    content             : string[]                  = []

    length              : number                    = 0


    push (str : string, len : number) {
        if (str.length === 0) return

        this.content.push(str)

        this.length     += len
    }


    toString () : string {
        return this.content.join('')
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type RGBColor = [ number, number, number ]


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Style extends Base {
    block               : XmlRenderBlock        = undefined

    $colorer            : Colorer               = undefined

    get colorer () : Colorer {
        if (this.$colorer !== undefined) return this.$colorer

        let c           = this.block.renderer.c

        if (this.underline) c = c.underline
        if (this.inverse) c = c.inverse
        if (this.bold) c = c.bold

        const color     = this.color
        if (color) c = c.rgb(color[ 0 ], color[ 1 ], color[ 2 ])

        const bgColor   = this.backgroundColor
        if (bgColor) c = c.bgRgb(bgColor[ 0 ], bgColor[ 1 ], bgColor[ 2 ])

        return this.$colorer  = c
    }

    // `undefined` means - look at the parent
    // any other value (including `null`) means - the value computed
    // `null` means - value computed, not set (analog of `unset` in CSS)


    $underline          : boolean           = undefined
    get underline () : boolean {
        if (this.$underline !== undefined) return this.$underline

        return this.$underline = this.block.parentBlock?.style.underline ?? false
    }
    set underline (value : boolean) {
        this.$underline = value
    }


    $inverse            : boolean           = undefined
    get inverse () : boolean {
        if (this.$inverse !== undefined) return this.$inverse

        return this.$inverse = this.block.parentBlock?.style.inverse ?? false
    }
    set inverse (value : boolean) {
        this.$inverse = value
    }


    $bold               : boolean           = undefined
    get bold () : boolean {
        if (this.$bold !== undefined) return this.$bold

        return this.$bold = this.block.parentBlock?.style.bold ?? false
    }
    set bold (value : boolean) {
        this.$bold = value
    }


    $color              : RGBColor            = undefined
    get color () : RGBColor {
        if (this.$color !== undefined) return this.$color

        return this.$color = this.block.parentBlock?.style.color ?? null
    }
    set color (value : RGBColor) {
        this.$color = value
    }


    $backgroundColor    : RGBColor            = undefined
    get backgroundColor () : RGBColor {
        if (this.$backgroundColor !== undefined) return this.$backgroundColor

        return this.$backgroundColor = this.block.parentBlock?.style.backgroundColor ?? null
    }
    set backgroundColor (value : RGBColor) {
        this.$backgroundColor = value
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRenderBlock extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class XmlRenderBlock extends base {
        canvas          : RenderCanvas      = undefined

        parentBlock     : this              = undefined

        renderer        : XmlRendererStreaming  = undefined

        element         : XmlElement        = undefined

        // indentation prefixes in the reversed order (the last one goes first, the first one will be repeated)
        indent          : string[]          = [ '' ]

        maxWidth        : number            = Number.MAX_SAFE_INTEGER

        $style          : Style             = undefined

        get style () : Style {
            if (this.$style !== undefined) return this.$style

            const style     = Style.new({ block : this })

            this.$style  = style

            this.renderer.applyStyleRules(this)

            return style
        }


        $blockLevelParent : XmlRenderBlock  = undefined

        get blockLevelParent () : XmlRenderBlock {
            if (this.$blockLevelParent !== undefined) return this.$blockLevelParent

            let blockLevelParent    = this

            while (blockLevelParent.type !== 'block') blockLevelParent  = blockLevelParent.parentBlock

            return this.$blockLevelParent   = blockLevelParent
        }


        get type () : 'block' | 'inline' {
            return this.renderer.getDisplayType(this.element)
        }


        $inlineBuffer   : Line[]            = undefined

        get inlineBuffer () : Line[] {
            if (this.$inlineBuffer !== undefined) return this.$inlineBuffer

            return this.$inlineBuffer   = []
        }


        write (str : string) {
            const inlineBuffer  = this.blockLevelParent.inlineBuffer

            // even if the string being written is empty - we still need to create a new line in the buffer
            if (inlineBuffer.length === 0) inlineBuffer.push(Line.new())

            const lines         = saneSplit(str, '\n')

            lines.forEach((line, index) => {
                let sourcePos               = 0

                while (sourcePos < line.length) {
                    const available     = index === 0 ? this.maxWidth - (inlineBuffer.length > 0 ? lastElement(inlineBuffer).length : 0) : this.maxWidth

                    const partial       = line.substr(sourcePos, available)

                    lastElement(inlineBuffer).push(this.element.styleText(partial, this), partial.length)

                    if (sourcePos + partial.length < line.length) inlineBuffer.push(Line.new())

                    sourcePos           += partial.length
                }

                if (index !== lines.length - 1) inlineBuffer.push(Line.new())
            })
        }


        writeStyledSameLineText (str : string, len : number) {
            const inlineBuffer  = this.blockLevelParent.inlineBuffer

            if (inlineBuffer.length === 0) inlineBuffer.push(Line.new())

            lastElement(inlineBuffer).push(str, len)
        }


        flushInlineBuffer () {
            const canvas        = this.canvas

            const inlineBuffer  = this.blockLevelParent.inlineBuffer

            inlineBuffer.forEach((line, index, array) => {
                canvas.write(...this.currentIndentation)
                canvas.write(line.toString(), line.length)

                if (index !== array.length - 1) canvas.newLine()
            })

            this.blockLevelParent.$inlineBuffer = undefined
        }


        get canMemoizeIndentation () : boolean {
            return this.indent.length === 1 && (this.parentBlock ? this.parentBlock.canMemoizeIndentation : true)
        }


        $currentIndentation         : [ string, number ]   = undefined

        get currentIndentation () : [ string, number ] {
            if (this.$currentIndentation !== undefined) return this.$currentIndentation

            let canMemoize          = this.canMemoizeIndentation
            const indentationStr    = lastElement(this.indent)

            const parentElement     = this.parentBlock?.element

            const indentation       = [
                parentElement?.styleChildIndentation(indentationStr, this) ?? this.element.styleIndentation(indentationStr, this),
                indentationStr.length
            ] as [ string, number ]

            if (this.indent.length > 1) this.indent.pop()

            if (this.parentBlock) {
                const parentIndentation = this.parentBlock.currentIndentation

                indentation[ 0 ]    = parentIndentation[ 0 ] + indentation[ 0 ]
                indentation[ 1 ]    += parentIndentation[ 1 ]
            }

            return canMemoize ? this.$currentIndentation = indentation : indentation
        }


        deriveChildBlock (element : XmlElement, index : number) {
            if (this.renderer.getDisplayType(element) === 'block') {
                this.flushInlineBuffer()
                this.canvas.newLinePending()

                const indent    =
                    this.renderer.customIndentation(this)
                    ?? this.element.childCustomIndentation(this.renderer, element, index)
                    ?? element.customIndentation(this.renderer)

                return XmlRenderBlock.new({
                    indent,

                    canvas          : this.canvas,
                    renderer        : this.renderer,
                    parentBlock     : this,
                    element,
                    maxWidth        : Math.max(this.maxWidth - indent[ 0 ].length, 1)
                })
            } else
                return XmlRenderBlock.new({
                    canvas          : this.canvas,
                    renderer        : this.renderer,
                    parentBlock     : this,
                    element,
                    maxWidth        : this.maxWidth
                })
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class RenderCanvas extends Base {
    canvas              : Line[]                    = []

    maxWidth            : number                    = Number.MAX_SAFE_INTEGER

    pendingNewLine      : boolean                   = false

    maxWidthFact        : number                    = 0


    newLinePending () {
        if (this.canvas.length === 0) return

        this.pendingNewLine = true
    }


    write (str : string, len : number) {
        // even if we write a zero-length string, we should still create a line in the canvas (if there were none)
        if (this.canvas.length === 0) this.newLine()

        if (this.pendingNewLine) {
            this.pendingNewLine = false
            this.newLine()
        }

        if (str.length === 0) return

        if (/\n/.test(str)) throw new Error("Should not contain new line characters")

        const lastLine  = this.lastLine

        lastLine.push(str, len)

        // if (lastLine.length > this.maxWidth) throw new Error("Should not exceed max width")

        if (lastLine.length > this.maxWidthFact) this.maxWidthFact = lastLine.length
    }


    writePlain (str : string) {
        this.write(str, str.length)
    }


    newLine () {
        this.canvas.push(Line.new())
    }


    // debugging convenience aid
    get asString () : string {
        return this.toString()
    }


    toString () : string {
        return this.canvas.map(line => line.toString()).join('\n')
    }


    get height () : number {
        return this.canvas.length
    }


    get lastLine () : Line {
        return lastElement(this.canvas)
    }
}
