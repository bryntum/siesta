import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { XmlElement } from "../../util/XmlElement.js"
import { Colorer } from "./Colorer.js"


//---------------------------------------------------------------------------------------------------------------------
export type ColorerRule = (c : Colorer) => Colorer

//---------------------------------------------------------------------------------------------------------------------
export class StyleMap extends Base {
    styles      : Map<string, ColorerRule>     = new Map()

    add (className : string, rule : ColorerRule) {
        this.styles.set(className, rule)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class Printer extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Printer extends base {
        styles      : StyleMap      = undefined


        print (el : XmlElement) {
            throw new Error("Abstract method")
        }


        write (str : string) {
            throw new Error("Abstract method")
        }
    }
){}




const defaultStyles = StyleMap.new()

defaultStyles.add('assertion', c => c.keyword('white'))
defaultStyles.add('assertion_name', c => c.keyword('gray'))
defaultStyles.add('assertion_source', c => c.keyword('gray'))
defaultStyles.add('assertion_source_line', c => c.keyword('yellow'))
defaultStyles.add('assertion_source_file', c => c.keyword('cyan'))
defaultStyles.add('difference', c => c.keyword('gray'))
defaultStyles.add('difference_key_path', c => c.keyword('white'))
