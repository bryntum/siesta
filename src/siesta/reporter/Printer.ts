import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRenderer } from "./XmlRenderer.js"


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


        write (el : XmlElement) {
            this.printLn(this.render(el).toString())
        }
    }

    return Printer
}) {}

