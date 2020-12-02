import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) =>

    class ProjectBrowser extends base {

        async setupBaseUrl () : Promise<string> {
            throw 1
        }
    }
) {}
