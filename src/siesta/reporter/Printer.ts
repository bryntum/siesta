import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { XmlRendererDifference } from "../../compare_deep/CompareDeepDiffRendering.js"
import { TextBlock } from "../../jsx/TextBlock.js"
import { XmlElement } from "../../jsx/XmlElement.js"


//---------------------------------------------------------------------------------------------------------------------
export class Printer extends Mixin(
    [ XmlRendererDifference, Base ],
    (base : ClassUnion<typeof XmlRendererDifference, typeof Base>) => {

    class Printer extends base {

        print (str : string) {
            throw new Error("Abstract method")
        }


        printLn (str : string) {
            this.print(str + '\n')
        }


        getMaxLen () : number {
            return Number.MAX_SAFE_INTEGER
        }


        write (el : XmlElement) {
            this.printLn(this.render(el, TextBlock.new({ maxLen : this.getMaxLen() })))
        }
    }

    return Printer
}) {}

