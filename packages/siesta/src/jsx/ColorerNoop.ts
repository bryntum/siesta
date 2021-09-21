import { Colorer } from "./Colorer.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColorerNoop extends Colorer {

    deriveColorerViaMethod (method : string, ...args : unknown[]) : Colorer {
        return this
    }


    deriveColorerViaProperty (styleName : string) : Colorer {
        return this
    }


    text (text : string) : string {
        return text
    }
}
