import { Base } from "../class/Base.js"
import { isString } from "../util/Typeguards.js"
import { Colorer } from "./Colorer.js"
import { TextBlock } from "./TextBlock.js"

//---------------------------------------------------------------------------------------------------------------------
export type RenderingProgress   = typeof SyncPoint

export const SyncPoint          = Symbol('SyncPoint')


//---------------------------------------------------------------------------------------------------------------------
export type MaybeColoredString  = string | ColoredString

//---------------------------------------------------------------------------------------------------------------------
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
        return ColoredStringWrapped.new({ string : this, c /*wrappings : c.wrappings()*/ })
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        throw new Error("Abstract method")
    }
}


//---------------------------------------------------------------------------------------------------------------------
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
        return this.new({ string, c/*, wrappings : c ? c.wrappings() : undefined*/ } as Partial<InstanceType<T>>)
    }
}


// //---------------------------------------------------------------------------------------------------------------------
// export class ColoredStringColorToken extends ColoredString {
//     c               : Colorer           = undefined
//
//     type            : 'open' | 'close'  = 'open'
//
//
//     get length () : number {
//         return 0
//     }
//
//
//     toString () : string {
//         return ''
//     }
//
//
//     substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
//         return this
//     }
// }


//---------------------------------------------------------------------------------------------------------------------
export class ColoredStringSyncPoint extends ColoredString {

    get length () : number {
        return 0
    }


    toString () : string {
        return ''
    }


    * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
        yield SyncPoint
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return this
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ColoredStringWrapped extends ColoredString {
    string          : ColoredString         = ColoredStringPlain.new()

    c               : Colorer               = undefined


    get length () : number {
        return this.string.length
    }


    toString () : string {
        return this.c.text(this.string.toString())
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return ColoredStringWrapped.new({
            c           : this.c,

            string      : this.string.substr(pos, howMany)
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
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

    // toStringBuffered (buffer : TextBlockRendering) {
    //     this.strings.forEach(string => isString(string) ? buffer.write(string) : string.toStringBuffered(buffer))
    // }


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
}
