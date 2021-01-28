import { Base } from "../class/Base.js"
import { saneSplit } from "../util/Helpers.js"
import { Colorer } from "./Colorer.js"


//---------------------------------------------------------------------------------------------------------------------
export class TextBlock extends Base {
    maxLen                  : number            = Number.MAX_SAFE_INTEGER

    minContentWidth         : number            = 2

    text                    : string[][]        = [ [ '' ] ]

    indentLevel             : number            = 0

    indentationString       : string            = ''

    currentIndentation      : string            = ''

    atNewLine               : boolean           = false


    initialize (props) {
        super.initialize(props)

        this.initIndent()
    }


    initIndent () {
        this.indentationString          = ' '.repeat(this.indentLevel)
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
        if (this.atNewLine) {
            this.lastLineBuffer.push(this.currentIndentation)
            this.atNewLine = false
        }

        this.lastLineBuffer.push(str)
    }


    addSameLineText (str : string) {
        if (str === '') return

        this.joinLastLine()

        if (this.lastLine.length + str.length < this.maxLen) {
            this.pushToLastLineBuffer(str)
        } else {
            let insertPos       = this.lastLine.length
            let sourcePos       = 0

            if (insertPos === this.maxLen) {
                this.addNewLine()
                insertPos       = 0
            }

            while (sourcePos < str.length) {
                let lenToInsert   = this.maxLen - insertPos

                if (lenToInsert < this.minContentWidth) lenToInsert = this.minContentWidth

                const toInsert  = str.substr(sourcePos, lenToInsert)

                this.pushToLastLineBuffer(toInsert)
                if (sourcePos + lenToInsert < str.length) this.addNewLine()

                insertPos       = this.currentIndentation.length

                sourcePos       += lenToInsert
            }
        }
    }


    addNewLine () {
        this.text.push([ '' ])

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
        const [ firstLine, ...otherLines ]  = another.text

        this.text[ this.text.length - 1 ].push(...firstLine)

        this.text.push(...otherLines)
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
                line.unshift(c.text(isLast ? '└' + indenterTree : '├' + indenterTree))
            } else {
                line.unshift(c.text(isLast ? ' ' + indenterPlain : '│' + indenterPlain))
            }
        })
    }
}
