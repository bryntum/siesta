import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Reporter } from "./Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterBrowser extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterBrowser extends base {

        print (str : string) {
            console.log(str)
        }
    }

    return ReporterBrowser
}) {}
