import { Base } from "../class/Base.js"
import { saneSplit } from "../util/Helpers.js"
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

    currentIndentation      : string            = ''

    atNewLine               : boolean           = true


    initialize (props) {
        super.initialize(props)

        this.initIndent()

        this.push(this.reserveChar.repeat(this.reserved))
    }


    initIndent () {
        this.indentationString          = ' '.repeat(this.indentLevel)

        // if (this.maxLen < this.minContentWidth) this.maxLen = this.minContentWidth
    }


    indent () {
        this.currentIndentation         += this.indentationString
    }


    // TODO
    indentWith (indentWith : MaybeColoredString[]) {
        this.indent()
    }


    outdent () {
        this.currentIndentation         = this.currentIndentation.slice(0, this.currentIndentation.length - this.indentLevel)
    }


    get maxLineLength () : number  {
        return Math.max(...this.text.map(stringSum => stringSum.length))
    }


    get lastLine () : ColoredStringSum  {
        return this.text[ this.text.length - 1 ]
    }


    pushToLastLineBuffer (str : string | ColoredString) {
        if (str.length === 0) return

        if (this.atNewLine) {
            this.atNewLine = false

            this.lastLine.push(this.currentIndentation)
        }

        this.lastLine.push(str)
    }


    addSameLineText (str : string | ColoredString) {
        if (str instanceof ColoredStringColorToken) {
            this.lastLine.push(str)
        } else {
            let sourcePos               = 0

            while (sourcePos < str.length) {
                const insertPos         = this.atNewLine ? this.currentIndentation.length : this.lastLine.length

                const freeLength        = this.maxLen - insertPos

                // if (freeLength < this.minContentWidth) freeLength = this.minContentWidth

                const toInsert          = str.substr(sourcePos, freeLength)

                const toInsertLength    = toInsert.length

                this.pushToLastLineBuffer(toInsert)

                if (sourcePos + toInsertLength < str.length) this.addNewLine()

                sourcePos               += toInsertLength
            }
        }
    }


    addNewLine () {
        this.text.push(ColoredStringSum.new())

        this.atNewLine      = true
    }


    startNewBlock () {
        const isEmpty       = this.atNewLine && this.text.length === 1

        !isEmpty && this.addNewLine()
    }


    push (...strings : (string | ColoredString)[]) {
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


    pushLn (...strings : (string | ColoredString)[]) {
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


    equalizeLineLengthsMut () {
        const maxLineLength     = this.maxLineLength

        this.text.forEach((line, index) => {
            const len       = line.length

            if (len < maxLineLength) line.push(' '.repeat(maxLineLength - len))
        })
    }
}
