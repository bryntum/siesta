import { Base } from "../class/Base.js"
import { saneSplit } from "../util/Helpers.js"
import { stripAnsiControlCharacters } from "../util_nodejs/Terminal.js"
import { Colorer } from "./Colorer.js"


//---------------------------------------------------------------------------------------------------------------------
export class TextBlock extends Base {
    maxLen                  : number            = Number.MAX_SAFE_INTEGER

    reserveChar             : string            = String.fromCharCode(0)
    reserved                : number            = 0

    // minContentWidth         : number            = 2

    text                    : string[][]        = [ [ '' ] ]
    textLength              : number[]          = [ 0 ]

    indentLevel             : number            = 0

    indentationString       : string            = ''

    currentIndentation      : string            = ''

    atNewLine               : boolean           = false


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


    outdent () {
        this.currentIndentation         = this.currentIndentation.slice(0, this.currentIndentation.length - this.indentLevel)
    }


    get lastLineBuffer () : string[]  {
        return this.text[ this.text.length - 1 ]
    }


    get lastLine () : string  {
        return this.lastLineBuffer[ 0 ]
    }


    joinLastLine () {
        this.text[ this.text.length - 1 ]   = [ this.lastLineBuffer.join('') ]
    }


    pushToLastLineBuffer (str : string) {
        if (str === '') return

        if (this.atNewLine) {
            this.atNewLine = false

            this.lastLineBuffer.push(this.currentIndentation)
            this.textLength[ this.textLength.length - 1 ] += this.currentIndentation.length
        }

        this.lastLineBuffer.push(str)

        this.textLength[ this.textLength.length - 1 ] += stripAnsiControlCharacters(str).length
    }


    addSameLineText (str : string) {
        this.joinLastLine()

        let sourcePos       = 0

        while (sourcePos < str.length) {
            const insertPos     = this.atNewLine ? this.currentIndentation.length : this.textLength[ this.textLength.length - 1 ]

            const lenToInsert   = this.maxLen - insertPos

            // if (lenToInsert < this.minContentWidth) lenToInsert = this.minContentWidth

            const toInsert      = str.substr(sourcePos, lenToInsert)

            this.pushToLastLineBuffer(toInsert)

            if (sourcePos + lenToInsert < str.length) this.addNewLine()

            sourcePos           += lenToInsert
        }
    }


    addNewLine () {
        this.text.push([ '' ])
        this.textLength.push(0)

        this.atNewLine      = true
    }


    push (...strings : string[]) {
        strings.forEach(string => saneSplit(string, '\n').forEach((str, index, array) => {
            this.addSameLineText(str)

            if (index !== array.length - 1) this.addNewLine()
        }))
    }


    pushLn (...strings : string[]) {
        this.push(...strings, '\n')
    }


    pullFrom (another : TextBlock) {
        another.text.forEach((line, index, array) => {
            if (index === 0) {
                this.textLength[ this.textLength.length - 1 ] += another.textLength[ 0 ] - another.reserved

                this.lastLineBuffer.push(line.join('').replace(this.reserveChar.repeat(another.reserved), ''))

            } else {
                this.text.push(line)
                this.textLength.push(another.textLength[ index ])
            }
        })
    }


    toString () : string {
        return this.text.map(parts => parts.join('')).join('\n')
    }


    colorizeMut (c : Colorer) {
        this.text.forEach((line, index) => this.text[ index ] = [ c.text(line.join('')) ])
    }


    indentMut (howMany : number, includeMarker : boolean = true) {
        const indenter              = ' '.repeat(howMany)
        const indenterWithMarker    = ' '.repeat(howMany - 2) + '· '

        this.text.forEach((line, index) => {
            this.textLength[ index ]    += howMany

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
            this.textLength[ index ]    += howMany

            if (index === 0) {
                line.unshift(c.text(isLast ? '└' + indenterTree : '├' + indenterTree))
            } else {
                line.unshift(c.text(isLast ? ' ' + indenterPlain : '│' + indenterPlain))
            }
        })
    }
}
