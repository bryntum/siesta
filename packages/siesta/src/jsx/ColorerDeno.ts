// @ts-ignore
import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"
import { Colorer } from "./Colorer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ColorerDeno extends Colorer {
    currentChalk    : any               = chalk


    deriveColorerViaMethod (method : string, ...args : unknown[]) : Colorer {
        return ColorerDeno.new({ currentChalk : this.currentChalk[ method ](...args) })
    }


    deriveColorerViaProperty (styleName : string) : Colorer {
        return ColorerDeno.new({ currentChalk : this.currentChalk[ styleName ] })
    }


    text (text : string) : string {
        return this.currentChalk(text)
    }
}
