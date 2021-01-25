import { Base } from "../class/Base.js"


//---------------------------------------------------------------------------------------------------------------------
export type ColorerRule = (c : Colorer) => Colorer


//---------------------------------------------------------------------------------------------------------------------
export class Colorer extends Base {
    get noop () : Colorer { return this }

    get reset () : Colorer { return this.deriveColorerViaProperty('reset') }
    get bold () : Colorer { return this.deriveColorerViaProperty('bold') }
    get dim () : Colorer { return this.deriveColorerViaProperty('dim') }
    get italic () : Colorer { return this.deriveColorerViaProperty('italic') }
    get underline () : Colorer { return this.deriveColorerViaProperty('underline') }
    get inverse () : Colorer { return this.deriveColorerViaProperty('inverse') }
    get hidden () : Colorer { return this.deriveColorerViaProperty('hidden') }
    get strikethrough () : Colorer { return this.deriveColorerViaProperty('strikethrough') }

    get black () : Colorer { return this.deriveColorerViaProperty('black') }
    get red () : Colorer { return this.deriveColorerViaProperty('red') }
    get green () : Colorer { return this.deriveColorerViaProperty('green') }
    get yellow () : Colorer { return this.deriveColorerViaProperty('yellow') }
    get blue () : Colorer { return this.deriveColorerViaProperty('blue') }
    get magenta () : Colorer { return this.deriveColorerViaProperty('magenta') }
    get cyan () : Colorer { return this.deriveColorerViaProperty('cyan') }
    get white () : Colorer { return this.deriveColorerViaProperty('white') }

        // Bright color
    get gray () : Colorer { return this.deriveColorerViaProperty('gray') }
    get blackBright () : Colorer { return this.deriveColorerViaProperty('blackBright') }
    get redBright () : Colorer { return this.deriveColorerViaProperty('redBright') }
    get greenBright () : Colorer { return this.deriveColorerViaProperty('greenBright') }
    get yellowBright () : Colorer { return this.deriveColorerViaProperty('yellowBright') }
    get blueBright () : Colorer { return this.deriveColorerViaProperty('blueBright') }
    get magentaBright () : Colorer { return this.deriveColorerViaProperty('magentaBright') }
    get cyanBright () : Colorer { return this.deriveColorerViaProperty('cyanBright') }
    get whiteBright () : Colorer { return this.deriveColorerViaProperty('whiteBright') }

    get bgBlack () : Colorer { return this.deriveColorerViaProperty('bgBlack') }
    get bgRed () : Colorer { return this.deriveColorerViaProperty('bgRed') }
    get bgGreen () : Colorer { return this.deriveColorerViaProperty('bgGreen') }
    get bgYellow () : Colorer { return this.deriveColorerViaProperty('bgYellow') }
    get bgBlue () : Colorer { return this.deriveColorerViaProperty('bgBlue') }
    get bgMagenta () : Colorer { return this.deriveColorerViaProperty('bgMagenta') }
    get bgCyan () : Colorer { return this.deriveColorerViaProperty('bgCyan') }
    get bgWhite () : Colorer { return this.deriveColorerViaProperty('bgWhite') }

        // Bright color
    get bgGray () : Colorer { return this.deriveColorerViaProperty('bgGray') }
    get bgBlackBright () : Colorer { return this.deriveColorerViaProperty('bgBlackBright') }
    get bgRedBright () : Colorer { return this.deriveColorerViaProperty('bgRedBright') }
    get bgGreenBright () : Colorer { return this.deriveColorerViaProperty('bgGreenBright') }
    get bgYellowBright () : Colorer { return this.deriveColorerViaProperty('bgYellowBright') }
    get bgBlueBright () : Colorer { return this.deriveColorerViaProperty('bgBlueBright') }
    get bgMagentaBright () : Colorer { return this.deriveColorerViaProperty('bgMagentaBright') }
    get bgCyanBright () : Colorer { return this.deriveColorerViaProperty('bgCyanBright') }
    get bgWhiteBright () : Colorer { return this.deriveColorerViaProperty('bgWhiteBright') }

    keyword (keyword : string) : Colorer { return this.deriveColorerViaMethod('keyword', keyword) }
    bgKeyword (keyword : string) : Colorer { return this.deriveColorerViaMethod('bgKeyword', keyword) }

    rgb (red : number, green : number, blue : number) : Colorer { return this.deriveColorerViaMethod('rgb', red, green, blue) }
    bgRgb (red : number, green : number, blue : number) : Colorer { return this.deriveColorerViaMethod('bgRgb', red, green, blue) }


    deriveColorerViaMethod (method : string, ...args : unknown[]) : Colorer {
        throw new Error("implement me")
    }


    deriveColorerViaProperty (styleName : string) : Colorer {
        throw new Error("implement me")
    }


    text (text : string) : string {
        throw new Error("implement me")
    }
}
