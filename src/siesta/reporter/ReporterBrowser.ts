import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { Reporter } from "./Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterBrowser extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => 

    class ReporterBrowser extends base {

        print (str : string) {
            console.log(str)
        }


        async fetchSources (url : string) : Promise<string[]> {
            const text  = await (await fetch(url)).text()

            return saneSplit(text, '\n')
        }
    }
) {}
