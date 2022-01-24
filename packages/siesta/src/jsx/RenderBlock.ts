import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { lastElement, saneSplit } from "../util/Helpers.js"
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

        $inlineBuffer   : Line[]            = undefined


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


        get inlineBuffer () : Line[] {
            if (this.$inlineBuffer !== undefined) return this.$inlineBuffer

            return this.$inlineBuffer   = [ Line.new() ]
        }


        write (str : string) {
            const inlineBuffer  = this.blockLevelParent.inlineBuffer

            const lines     = saneSplit(str, '\n')

            lines.forEach((line, index) => {
                let sourcePos               = 0

                while (sourcePos < line.length) {
                    const available     = index === 0 ? this.maxWidth - lastElement(inlineBuffer).length : this.maxWidth

                    const partial       = line.substr(sourcePos, available)

                    lastElement(inlineBuffer).push(this.renderer.style(partial, this.element), partial.length)

                    if (sourcePos + partial.length < line.length) inlineBuffer.push(Line.new())

                    sourcePos           += partial.length
                }

                if (index !== lines.length - 1) inlineBuffer.push(Line.new())
            })
        }


        flushInlineBuffer () {
            const canvas        = this.canvas

            const inlineBuffer  = this.blockLevelParent.inlineBuffer

            if (!(inlineBuffer.length === 1 && inlineBuffer[ 0 ].length === 0))
                inlineBuffer.forEach((line, index, array) => {
                    const indentation       = this.currentIndentation
                    const styled            = this.element.styleIndentation(indentation)

                    canvas.write(styled, indentation.length)

                    canvas.write(line.toString(), line.length)

                    if (index !== array.length - 1) canvas.newLine()
                })

            this.blockLevelParent.$inlineBuffer = undefined
        }


        get canMemoizeIndentation () : boolean {
            return this.indent.length === 1 && (this.parentBlock ? this.parentBlock.canMemoizeIndentation : true)
        }


        $currentIndentation     : string            = undefined

        get currentIndentation () : string {
            if (this.$currentIndentation !== undefined) return this.$currentIndentation

            let canMemoize      = this.canMemoizeIndentation
            let indentation     = lastElement(this.indent)

            if (this.indent.length > 1) this.indent.pop()

            if (this.parentBlock) indentation = this.parentBlock.currentIndentation + indentation

            return canMemoize ? this.$currentIndentation = indentation : indentation
        }


        deriveChildBlock (element : XmlElement, index : number) {
            if (this.renderer.getDisplayType(element) === 'block') {
                this.flushInlineBuffer()
                this.canvas.newLinePending()

                const indent            = this.element.childCustomIndentation(this.renderer, element, index) ?? element.customIndentation(this.renderer)

                return XmlRenderBlock.new({
                    indent,

                    canvas          : this.canvas,
                    renderer        : this.renderer,
                    parentBlock     : this,
                    element,
                    maxWidth        : this.maxWidth - indent[ 0 ].length
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
    canvas              : Line[]                    = [ Line.new() ]

    maxWidth            : number                    = Number.MAX_SAFE_INTEGER

    pendingNewLine      : boolean                   = false


    newLinePending () {
        if (this.canvas.length === 1 && this.canvas[ 0 ].length === 0) return

        this.pendingNewLine = true
    }


    write (str : string, len : number) {
        if (str.length === 0) return

        if (this.pendingNewLine) {
            this.pendingNewLine = false
            this.newLine()
        }

        if (/\n/.test(str)) throw new Error("Should not contain new line characters")

        lastElement(this.canvas).push(str, len)

        if (lastElement(this.canvas).length > this.maxWidth) throw new Error("Should not exceed max width")
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
}
