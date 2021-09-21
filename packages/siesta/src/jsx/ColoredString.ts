import { Base } from "../class/Base.js"
import { isString } from "../util/Typeguards.js"
import { Colorer } from "./Colorer.js"
import { TextBlock } from "./TextBlock.js"
import { XmlElement } from "./XmlElement.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type RenderingProgress   = ColoredStringSyncPoint | ColoredStringSuppressSyncPoints | ColoredStringResumeSyncPoints

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type MaybeColoredString  = string | ColoredString

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredString extends Base {

    get length () : number {
        throw new Error("Abstract method")
    }


    toString () : string {
        throw new Error("Abstract method")
    }


    * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
        output.lastLine.push(this)
    }


    colorize (c : Colorer) : ColoredString {
        if (this.length === 0)
            return this
        else
            return ColoredStringWrapped.new({ string : this, c })
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        throw new Error("Abstract method")
    }


    tokens () : ColoredStringToken[] {
        return []
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringPlain extends ColoredString {
    string          : string                = ''

    c               : Colorer               = undefined


    get length () : number {
        return this.string.length
    }


    toString () : string {
        return this.c.text(this.string)
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return ColoredStringPlain.new({
            c           : this.c,

            string      : this.string.substr(pos, howMany)
        })
    }


    static fromString<T extends typeof ColoredStringPlain> (this : T, string : string, c? : Colorer) : InstanceType<T> {
        return this.new({ string, c } as Partial<InstanceType<T>>)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringToken extends ColoredString {

    get length () : number {
        return 0
    }


    toString () : string {
        return ''
    }


    * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
        yield this
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return this
    }


    colorize (c : Colorer) : ColoredString {
        return this
    }


    tokens () : ColoredStringToken[] {
        return [ this ]
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringSyncPoint extends ColoredStringToken {
    el          : XmlElement        = undefined
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringSuppressSyncPoints extends ColoredStringToken {
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringResumeSyncPoints extends ColoredStringToken {
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringWrapped extends ColoredString {
    string          : ColoredString         = ColoredStringPlain.new()

    c               : Colorer               = undefined


    get length () : number {
        return this.string.length
    }


    toString () : string {
        return this.c.text(this.string.toString())
    }


    // TODO not sure how this works... probably because there are several elements levels
    // in this method, we loose the color information (`c`)
    // it should probably push a new color start / color end tokens into the output
    // and then output should have an extra processing for these tokens
    // but seems to work somehow, leaving this for future
    * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
        yield* this.string.toTextBlockGen(output)
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return ColoredStringWrapped.new({
            c           : this.c,

            string      : this.string.substr(pos, howMany)
        })
    }


    tokens () : ColoredStringToken[] {
        return isString(this.string) ? [] : this.string.tokens()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColoredStringSum extends ColoredString {
    strings         : (string | ColoredString)[]       = []


    get length () : number {
        return this.strings.reduce((acc, str) => acc + str.length, 0)
    }


    toString () : string {
        return this.strings.map(str => str.toString()).join('')
    }


    * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
        for (const string of this.strings) {
            if (isString(string)) {
                output.lastLine.push(string)
            } else {
                yield* string.toTextBlockGen(output)
            }
        }
    }


    push (string : string | ColoredString) {
        this.strings.push(string)
    }


    unshift (string : string | ColoredString) {
        this.strings.unshift(string)
    }


    colorize (c : Colorer) : ColoredStringSum {
        return ColoredStringSum.new({
            strings     : this.strings.map(string => isString(string) ? ColoredStringPlain.fromString(string, c) : string.colorize(c))
        })
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        let currentPos          = 0

        // for some reason TS can't figure out the right override for this `reduce` call
        // need to specify the generic argument explicitly
        // might be because of the function return type inference
        return this.strings.reduce<ColoredStringSum>(
            (acc : ColoredStringSum, str : string | ColoredString) : ColoredStringSum => {
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
            },
            ColoredStringSum.new()
        )
    }


    tokens () : ColoredStringToken[] {
        return this.strings.flatMap(string => isString(string) ? [] : string.tokens())
    }
}
