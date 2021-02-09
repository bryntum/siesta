import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Reporter } from "./Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterNodejs extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterNodejs extends base {

        getMaxLen () : number {
            return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
        }


        print (str : string) {
            process.stdout.write(str)
        }
    }

    return ReporterNodejs
}) {}
