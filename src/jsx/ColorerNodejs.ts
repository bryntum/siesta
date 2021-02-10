import chalk from "chalk"
import { Colorer } from "./Colorer.js"

//---------------------------------------------------------------------------------------------------------------------
const zero  = String.fromCharCode(0)


//---------------------------------------------------------------------------------------------------------------------
export class ColorerNodejs extends Colorer {
    currentChalk    : any               = chalk


    deriveColorerViaMethod (method : string, ...args : unknown[]) : Colorer {
        return ColorerNodejs.new({ currentChalk : this.currentChalk[ method ](...args) })
    }


    deriveColorerViaProperty (styleName : string) : Colorer {
        return ColorerNodejs.new({ currentChalk : this.currentChalk[ styleName ] })
    }


    text (text : string) : string {
        return this.currentChalk(text)
    }


    wrappings () : [ string, string ] {
        return this.currentChalk(zero).split(zero)
    }
}
