import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { XmlRendererDifference } from "../../compare_deep/CompareDeepDiffRendering.js"
import { Hook } from "../../hook/Hook.js"
import { TextBlock } from "../../jsx/TextBlock.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { ArbitraryObject } from "../../util/Helpers.js"


//---------------------------------------------------------------------------------------------------------------------
export class ConsoleXmlRenderer extends Mixin(
    [ XmlRendererDifference ],
    (base : ClassUnion<typeof XmlRendererDifference>) => {

    class ConsoleXmlRenderer extends base {

        beforePrintHook     : Hook<[ ArbitraryObject ]>     = new Hook()
        afterPrintHook      : Hook<[ ArbitraryObject ]>     = new Hook()


        doPrint (str : string) {
            throw new Error("Abstract method")
        }


        print (str : string) {
            const state     = {}

            this.beforePrintHook.trigger(state)

            this.doPrint(str)

            this.afterPrintHook.trigger(state)
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

    return ConsoleXmlRenderer
}) {}
