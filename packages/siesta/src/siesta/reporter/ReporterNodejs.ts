import fs from "fs"
import fetch from "node-fetch"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { Reporter } from "./Reporter.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ReporterNodejs extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => 

    class ReporterNodejs extends base {

        async fetchSources (url : string) : Promise<string[]> {
            try {
                if (/^http/.test(url)) {

                    const text  = await (await fetch(url)).text()

                    return saneSplit(text, '\n')
                } else {
                    const text  = await new Promise<string>(resolve => fs.readFile(url, 'utf8', (err, data) => resolve(data)))

                    return text ? saneSplit(text, '\n') : undefined
                }
            } catch (e) {
                return undefined
            }
        }
    }
) {}
