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

        async fetchSources (url : string) : Promise<string[]> {
            try {
                if (/^http/.test(url)) {
                    const text  = await (await fetch(url)).text()

                    return saneSplit(text, '\n')
                } else {
                    const text  = await Deno.readTextFile(url)

                    return text ? saneSplit(text, '\n') : undefined
                }
            } catch (e) {
                return undefined
            }
        }
    }

    return ReporterDeno
}) {}
