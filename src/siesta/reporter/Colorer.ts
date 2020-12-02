import { Base } from "../../class/Base.js"

export class Colorer extends Base {
    get noop () : Colorer { return this }

    get reset () : Colorer { return this.deriveColorer('reset') }
    get bold () : Colorer { return this.deriveColorer('bold') }
    get dim () : Colorer { return this.deriveColorer('dim') }
    get italic () : Colorer { return this.deriveColorer('italic') }
    get underline () : Colorer { return this.deriveColorer('underline') }
    get inverse () : Colorer { return this.deriveColorer('inverse') }
    get hidden () : Colorer { return this.deriveColorer('hidden') }
    get strikethrough () : Colorer { return this.deriveColorer('strikethrough') }

    get black () : Colorer { return this.deriveColorer('black') }
    get red () : Colorer { return this.deriveColorer('red') }
    get green () : Colorer { return this.deriveColorer('green') }
    get yellow () : Colorer { return this.deriveColorer('yellow') }
    get blue () : Colorer { return this.deriveColorer('blue') }
    get magenta () : Colorer { return this.deriveColorer('magenta') }
    get cyan () : Colorer { return this.deriveColorer('cyan') }
    get white () : Colorer { return this.deriveColorer('white') }

        // Bright color
    get gray () : Colorer { return this.deriveColorer('gray') }
    get blackBright () : Colorer { return this.deriveColorer('blackBright') }
    get redBright () : Colorer { return this.deriveColorer('redBright') }
    get greenBright () : Colorer { return this.deriveColorer('greenBright') }
    get yellowBright () : Colorer { return this.deriveColorer('yellowBright') }
    get blueBright () : Colorer { return this.deriveColorer('blueBright') }
    get magentaBright () : Colorer { return this.deriveColorer('magentaBright') }
    get cyanBright () : Colorer { return this.deriveColorer('cyanBright') }
    get whiteBright () : Colorer { return this.deriveColorer('whiteBright') }

    get bgBlack () : Colorer { return this.deriveColorer('bgBlack') }
    get bgRed () : Colorer { return this.deriveColorer('bgRed') }
    get bgGreen () : Colorer { return this.deriveColorer('bgGreen') }
    get bgYellow () : Colorer { return this.deriveColorer('bgYellow') }
    get bgBlue () : Colorer { return this.deriveColorer('bgBlue') }
    get bgMagenta () : Colorer { return this.deriveColorer('bgMagenta') }
    get bgCyan () : Colorer { return this.deriveColorer('bgCyan') }
    get bgWhite () : Colorer { return this.deriveColorer('bgWhite') }

        // Bright color
    get bgGray () : Colorer { return this.deriveColorer('bgGray') }
    get bgBlackBright () : Colorer { return this.deriveColorer('bgBlackBright') }
    get bgRedBright () : Colorer { return this.deriveColorer('bgRedBright') }
    get bgGreenBright () : Colorer { return this.deriveColorer('bgGreenBright') }
    get bgYellowBright () : Colorer { return this.deriveColorer('bgYellowBright') }
    get bgBlueBright () : Colorer { return this.deriveColorer('bgBlueBright') }
    get bgMagentaBright () : Colorer { return this.deriveColorer('bgMagentaBright') }
    get bgCyanBright () : Colorer { return this.deriveColorer('bgCyanBright') }
    get bgWhiteBright () : Colorer { return this.deriveColorer('bgWhiteBright') }


    deriveColorer (styleName : string) : Colorer {
        throw new Error("implement me")
    }


    text (text : string) : string {
        throw new Error("implement me")
    }


    write (text : string) {
        throw new Error("implement me")
    }
}
