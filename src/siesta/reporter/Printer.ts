import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { XmlRenderer } from "../../jsx/XmlRenderer.js"


//---------------------------------------------------------------------------------------------------------------------
export class Printer extends Mixin(
    [ XmlRenderer, Base ],
    (base : ClassUnion<typeof XmlRenderer, typeof Base>) => {

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
            this.printLn(this.render(el, this.getMaxLen()).toString())
        }
    }

    return Printer
}) {}

