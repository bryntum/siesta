import { Base } from "../class/Base.js"
import { saneSplit } from "../util/Helpers.js"
import { isString } from "../util/Typeguards.js"
import { Colorer } from "./Colorer.js"


//---------------------------------------------------------------------------------------------------------------------
export class ManagedString extends Base {

    get length () : number {
        throw new Error("Abstract method")
    }

    toString () : string {
        throw new Error("Abstract method")
    }


    colorize (c : Colorer) : ManagedString {
        return ManagedStringWrapped.new({
            string      : this,

            ...c.wrappings()
        })
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ManagedString {
        throw new Error("Abstract method")
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ManagedStringPlain extends ManagedString {
    string          : string        = ''

    open            : string        = ''
    close           : string        = ''


    get length () : number {
        return this.string.length
    }

    toString () : string {
        return this.open + this.string + this.close
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ManagedString {
        return ManagedStringPlain.new({
            open        : this.open,
            close       : this.close,

            string      : this.string.substr(pos, howMany)
        })
    }


    static fromString<T extends typeof ManagedStringPlain> (this : T, string : string) : InstanceType<T> {
        return this.new({ string } as Partial<InstanceType<T>>)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ManagedStringWrapped extends ManagedString {
    string          : ManagedString = ManagedStringPlain.new()

    open            : string        = ''
    close           : string        = ''


    get length () : number {
        return this.string.length
    }


    toString () : string {
        return this.open + this.string + this.close
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ManagedString {
        return ManagedStringWrapped.new({
            open        : this.open,
            close       : this.close,

            string      : this.string.substr(pos, howMany)
        })
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class ManagedStringSum extends ManagedString {
    strings         : ManagedString[]       = []


    get length () : number {
        return this.strings.reduce((acc, str) => acc + str.length, 0)
    }

    toString () : string {
        return this.strings.map(str => str.toString()).join('')
    }


    push (string : string | ManagedString) {
        if (isString(string))
            this.strings.push(ManagedStringPlain.fromString(string))
        else
            this.strings.push(string)
    }


    unshift (string : string | ManagedString) {
        if (isString(string))
            this.strings.unshift(ManagedStringPlain.fromString(string))
        else
            this.strings.unshift(string)
    }


    colorize (c : Colorer) : ManagedStringSum {
        return ManagedStringSum.new({
            strings     : this.strings.map(string => string.colorize(c))
        })
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ManagedString {
        let currentPos          = 0

        return this.strings.reduce((acc : ManagedStringSum, str : ManagedString) => {
            const charsLeftToStartCapturing     = pos - currentPos

            let offset : number = 0

            if (charsLeftToStartCapturing > 0) {
                currentPos  += str.length

                if (str.length <= charsLeftToStartCapturing) {
                    return acc
                }
                else {
                    offset      = str.length - charsLeftToStartCapturing
                }
            }

            const remaining     = howMany - acc.length

            if (str.length - offset >= remaining) {
                acc.push(str.substr(offset, remaining))
            } else {
                if (offset > 0)
                    acc.push(str.substr(offset))
                else
                    acc.push(str)
            }

            return acc
        }, ManagedStringSum.new())
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class TextBlock extends Base {
    maxLen                  : number            = Number.MAX_SAFE_INTEGER

    reserveChar             : string            = String.fromCharCode(0)
    reserved                : number            = 0

    // minContentWidth         : number            = 2

    text                    : ManagedStringSum[] = [ ManagedStringSum.new() ]

    indentLevel             : number            = 0

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


    outdent () {
        this.currentIndentation         = this.currentIndentation.slice(0, this.currentIndentation.length - this.indentLevel)
    }


    get lastLine () : ManagedStringSum  {
        return this.text[ this.text.length - 1 ]
    }


    pushToLastLineBuffer (str : string | ManagedString) {
        if (str.length === 0) return

        if (this.atNewLine) {
            this.atNewLine = false

            this.lastLine.push(this.currentIndentation)
        }

        this.lastLine.push(str)
    }


    addSameLineText (str : string | ManagedString) {
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


    addNewLine () {
        this.text.push(ManagedStringSum.new())

        this.atNewLine      = true
    }


    push (...strings : (string | ManagedString)[]) {
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


    pushLn (...strings : (string | ManagedString)[]) {
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
                line.unshift(ManagedStringPlain.fromString(isLast ? '└' + indenterTree : '├' + indenterTree).colorize(c))
            } else {
                line.unshift(ManagedStringPlain.fromString(isLast ? ' ' + indenterPlain : '│' + indenterPlain).colorize(c))
            }
        })
    }
}
