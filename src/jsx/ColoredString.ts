import { Base } from "../class/Base.js"
import { isString } from "../util/Typeguards.js"
import { Colorer } from "./Colorer.js"

//---------------------------------------------------------------------------------------------------------------------
export class ColoredString extends Base {

    get length () : number {
        throw new Error("Abstract method")
    }


    toString () : string {
        throw new Error("Abstract method")
    }


    colorize (c : Colorer) : ColoredString {
        return ColoredStringWrapped.new({ string : this, wrappings : c.wrappings() })
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        throw new Error("Abstract method")
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ColoredStringPlain extends ColoredString {
    string          : string                = ''

    wrappings       : [ string, string ]    = undefined


    get length () : number {
        return this.string.length
    }


    toString () : string {
        const wrappings     = this.wrappings

        return wrappings ? wrappings[ 0 ] + this.string + wrappings[ 1 ] : this.string
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return ColoredStringPlain.new({
            wrappings   : this.wrappings,

            string      : this.string.substr(pos, howMany)
        })
    }


    static fromString<T extends typeof ColoredStringPlain> (this : T, string : string, c? : Colorer) : InstanceType<T> {
        return this.new({ string, wrappings : c ? c.wrappings() : undefined } as Partial<InstanceType<T>>)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ColoredStringWrapped extends ColoredString {
    string          : ColoredString         = ColoredStringPlain.new()

    wrappings       : [ string, string ]    = undefined


    get length () : number {
        return this.string.length
    }


    toString () : string {
        const wrappings     = this.wrappings

        return wrappings ? wrappings[ 0 ] + this.string + wrappings[ 1 ] : this.string.toString()
    }


    substr (pos : number, howMany : number = Number.MAX_SAFE_INTEGER) : ColoredString {
        return ColoredStringWrapped.new({
            wrappings   : this.wrappings,

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
