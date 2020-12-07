import { Colorer } from "./Colorer.js"


//---------------------------------------------------------------------------------------------------------------------
export class ColorerBrowser extends Colorer {

    deriveColorer (styleName : string) : Colorer {
        return this
    }


    text (text : string) : string {
        return text
    }
}
