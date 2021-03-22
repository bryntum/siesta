import { Base } from "../class/Base.js"
import { lastElement, NonEmptyArray, saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { ColoredStringPlain, ColoredStringSum, ColoredStringToken, MaybeColoredString, RenderingProgress } from "./ColoredString.js"
import { Colorer } from "./Colorer.js"


// //---------------------------------------------------------------------------------------------------------------------
// export class TextBlockRenderingBuffer extends Base {
//     c               : Colorer           = undefined
//
//     content         : string[]          = []
//
//
//     write (str : MaybeColoredString) {
//         this.content.push(str.toString())
//     }
//
//
//     newLine () {
//         this.content.push('\n')
//     }
//
//
//     toString () : string {
//         const content       = this.content.join('')
//
//         return this.c ? this.c.text(content) : content
//     }
// }
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export class TextBlockRendering extends Base {
//
//     buffers : TextBlockRenderingBuffer[]        = [ TextBlockRenderingBuffer.new() ]
//
//
//     get buffer () : TextBlockRenderingBuffer {
//         return lastElement(this.buffers)
//     }
//
//
//     write (str : MaybeColoredString) {
//         if (str instanceof ColoredStringColorToken) {
//             if (str.type === 'open') {
//                 this.buffers.push(TextBlockRenderingBuffer.new({ c : str.c }))
//             } else {
//                 const buffer        = this.buffer
//
//                 this.buffers.pop()
//
//                 this.buffer.write(buffer.toString())
//             }
//         } else {
//             this.buffer.write(str)
//         }
//     }
//
//
//     toString () : string {
//         if (this.buffers.length > 1) throw new Error('Incorrect state')
//
//         return this.buffer.toString()
//     }
// }



//---------------------------------------------------------------------------------------------------------------------
export class TextBlock extends Base {
    maxLen                  : number            = Number.MAX_SAFE_INTEGER

    reserveChar             : string            = String.fromCharCode(0)
    reserved                : number            = 0

    // minContentWidth         : number            = 2

    text                    : ColoredStringSum[] = [ ColoredStringSum.new() ]

    indentLevel             : number            = 2

    indentationString       : string            = ''

    atNewLine               : boolean           = true

    indentationBuffer       : MaybeColoredString[][]    = []

    context                 : 'inline' | 'opened_block' | 'closed_block' = 'opened_block'


    $currentIndentation     : string            = undefined

    get currentIndentation () : string {
        if (this.$currentIndentation !== undefined) return this.$currentIndentation

        return this.$currentIndentation = this.indentationBuffer.map(buffer => lastElement(buffer)).join('')
    }


    initialize (props) {
        super.initialize(props)

        this.initIndent()

        this.push(this.reserveChar.repeat(this.reserved))
    }


    initIndent () {
        this.indentationString          = ' '.repeat(this.indentLevel)

        // if (this.maxLen < this.minContentWidth) this.maxLen = this.minContentWidth
    }


    indent (indentWith : NonEmptyArray<MaybeColoredString> = [ this.indentationString ]) {
        const lengthFirst               = indentWith[ 0 ].length
        const allIndentsHasSameLength   = indentWith.every(str => str.length === lengthFirst)

        if (!allIndentsHasSameLength) throw new Error("`indentWith` argument should contain array of strings with equal lengths")

        indentWith.reverse()

        this.indentationBuffer.push(indentWith)

        this.$currentIndentation        = undefined
    }


    outdent () {
        this.indentationBuffer.pop()

        this.$currentIndentation        = undefined
    }


    get maxLineLength () : number  {
        return Math.max(...this.text.map(stringSum => stringSum.length))
    }


    get lastLine () : ColoredStringSum  {
        return this.text[ this.text.length - 1 ]
    }


    // this is used as `reserved` argument for a child text block
    get lastLineLengthWithIndent () : number  {
        return this.lastLine.length === 0 ? 0 : this.lastLine.length - this.currentIndentation.length
    }


    pushToLastLine (str : MaybeColoredString) {
        if (str.length === 0) return

        this.resolveNewLine()

        this.lastLine.push(str)

        this.context    = 'inline'
    }


    resolveNewLine () {
        if (this.atNewLine) {
            this.atNewLine = false

            this.lastLine.push(this.currentIndentation)

            if (this.indentationBuffer.length > 0) {
                const lastIndentation           = lastElement(this.indentationBuffer)

                if (lastIndentation.length > 1) {
                    lastIndentation.pop()
                    this.$currentIndentation    = undefined
                }
            }
        }
    }


    addSameLineText (str : MaybeColoredString) {
        // push tokens directly, since they have length of 0
        if (str instanceof ColoredStringToken) {
            this.lastLine.push(str)
        } else {
            let sourcePos               = 0

            while (sourcePos < str.length) {
                const insertPos         = this.atNewLine ? this.currentIndentation.length : this.lastLine.length

                const freeLength        = this.maxLen - insertPos

                // if (freeLength < this.minContentWidth) freeLength = this.minContentWidth

                const toInsert          = str.substr(sourcePos, freeLength)

                const toInsertLength    = toInsert.length

                this.pushToLastLine(toInsert)

                if (sourcePos + toInsertLength < str.length) this.addNewLine()

                sourcePos               += toInsertLength
            }
        }
    }


    addNewLine () {
        this.text.push(ColoredStringSum.new())

        this.atNewLine      = true
    }


    // multiple nested open block will result in a single new line
    openBlock () {
        if (this.context === 'inline' || this.context === 'closed_block') this.addNewLine()

        this.context = 'opened_block'
    }


    closeBlock () {
        this.context = 'closed_block'
    }


    write (...strings : MaybeColoredString[]) {
        this.push(...strings)
    }


    push (...strings : MaybeColoredString[]) {
        strings.forEach(string => {
            if (isString(string)) {
                saneSplit(string, '\n').forEach((str, index, array) => {
                    this.addSameLineText(str)

                    if (index !== array.length - 1) this.addNewLine()
                })
            } else {
                this.addSameLineText(string)
            }
        })
    }


    pushLn (...strings : MaybeColoredString[]) {
        this.push(...strings, '\n')
    }


    pullFrom (another : TextBlock) {
        another.text.forEach((line, index, array) => {
            if (index === 0) {
                this.push(line.substr(another.reserved))
            } else {
                this.push(line)
            }

            if (index !== array.length - 1) this.addNewLine()
        })
    }


    // debugging convenience aid
    get asString () : string {
        return this.toString()
    }


    toString () : string {
        return this.text.map(str => str.toString()).join('\n')

        // const rendering : TextBlockRendering     = TextBlockRendering.new()
        //
        // this.text.forEach((line, index) => {
        //     line.toStringBuffered(rendering)
        //
        //     if (index !== this.text.length - 1) rendering.write('\n')
        // })
        //
        // return rendering.toString()
    }


    * copySynced (output : TextBlock) : Generator<RenderingProgress> {
        let i = 0

        for (const line of this.text) {
            yield* line.toTextBlockGen(output)

            if (i++ !== this.text.length - 1) output.addNewLine()
        }
    }


    colorizeMut (c : Colorer) {
        this.text   = this.text.map(string => string.colorize(c))
    }


    indentMut (howMany : number, includeMarker : boolean = true) {
        const indenter              = ' '.repeat(howMany)
        const indenterWithMarker    = ' '.repeat(howMany - 2) + '· '

        this.text.forEach((line, index) => {

            if (index === 0 && includeMarker) {
                line.unshift(indenterWithMarker)
            } else {
                line.unshift(indenter)
            }
        })
    }


    indentAsTreeLeafMut (howMany : number, isLast : boolean, c : Colorer) {
        const indenterPlain     = ' '.repeat(howMany - 1)
        const indenterTree      = '─'.repeat(howMany - 1)

        this.text.forEach((line, index) => {
            if (index === 0) {
                line.unshift(ColoredStringPlain.fromString(isLast ? '└' + indenterTree : '├' + indenterTree, c))
            } else {
                line.unshift(ColoredStringPlain.fromString(isLast ? ' ' + indenterPlain : '│' + indenterPlain, c))
            }
        })
    }


    equalizeLineLengthsMut (append : boolean = true) {
        const maxLineLength     = this.maxLineLength

        this.text.forEach(line => {
            const len       = line.length

            if (len < maxLineLength)
                if (append)
                    line.push(' '.repeat(maxLineLength - len))
                else
                    line.unshift(' '.repeat(maxLineLength - len))
        })
    }
}
