import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { TestNodeResultReactive } from "../test/TestResult.js"
import { Reporter } from "./Reporter.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ReporterBrowser extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) =>

    class ReporterBrowser extends base {

        override print (str : string) {
            console.log(str)
        }


        override async fetchSources (url : string) : Promise<string[]> {
            const text  = await (await fetch(url)).text()

            return saneSplit(text, '\n')
        }


        async onSubTestFinish (testNode : TestNodeResultReactive) {
            // do nothing - suppress the text output to console
        }
    }
) {}

