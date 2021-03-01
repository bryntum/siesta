import { Base } from "../class/Base.js"
import { lastElement, NonEmptyArray, saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { ColoredString, ColoredStringColorToken, ColoredStringPlain, ColoredStringSum, MaybeColoredString } from "./ColoredString.js"
import { Colorer } from "./Colorer.js"


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


    pushToLastLine (str : MaybeColoredString) {
        if (str.length === 0) return

        if (this.atNewLine) {
            this.atNewLine = false

            this.addNewLineInternal()
        }

        this.lastLine.push(str)

        this.context    = 'inline'
    }


    addNewLineInternal () {
        this.lastLine.push(this.currentIndentation)

        if (this.indentationBuffer.length > 0) {
            const lastIndentation           = lastElement(this.indentationBuffer)

            if (lastIndentation.length > 1) {
                lastIndentation.pop()
                this.$currentIndentation    = undefined
            }
        }
    }


    addSameLineText (str : MaybeColoredString) {
        if (str instanceof ColoredStringColorToken) {
            // TODO this seems wrong - should split on `\n`
            this.pushToLastLine(str)
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


    toString () : string {
        return this.text.map(parts => parts.toString()).join('\n')
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
                line.unshift(ColoredStringPlain.fromString(isLast ? '└' + indenterTree : '├' + indenterTree).colorize(c))
            } else {
                line.unshift(ColoredStringPlain.fromString(isLast ? ' ' + indenterPlain : '│' + indenterPlain).colorize(c))
            }
        })
    }


    equalizeLineLengthsMut (append : boolean = true) {
        const maxLineLength     = this.maxLineLength

        this.text.forEach((line, index) => {
            const len       = line.length

            if (len < maxLineLength)
                if (append)
                    line.push(' '.repeat(maxLineLength - len))
                else
                    line.unshift(' '.repeat(maxLineLength - len))
        })
    }
}
