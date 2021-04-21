import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { Reporter } from "./Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
declare const Deno : any


//---------------------------------------------------------------------------------------------------------------------
export class ReporterDeno extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterDeno extends base {

        getMaxLen () : number {
            return /*process.stdout.columns ?? */Number.MAX_SAFE_INTEGER
        }


        doPrint (str : string) {
            this.launcher.print(str)
        }


        async fetchSources (url : string) : Promise<string[]> {
            if (/^http/.test(url)) {
                const text  = await (await fetch(url)).text()

                return saneSplit(text, '\n')
            } else {
                const text  = await Deno.readTextFile(url)

                return text ? saneSplit(text, '\n') : undefined
            }
        }
    }

    return ReporterDeno
}) {}
