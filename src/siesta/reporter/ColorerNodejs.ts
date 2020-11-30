import chalk from "chalk"
import { Colorer } from "./Colorer.js"

export class ColorerNodejs extends Colorer {
    currentChalk    : any               = chalk


    deriveColorer (styleName : string) : Colorer {
        return ColorerNodejs.new({ currentChalk : this.currentChalk[ styleName ] })
    }


    text (text : string) : string {
        return this.currentChalk(text)
    }


    write (text : string) {
        console.log(this.currentChalk(text))
    }
}
