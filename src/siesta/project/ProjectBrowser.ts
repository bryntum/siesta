import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) => {

    class ProjectBrowser extends base {

        buildBaseUrl () : string {
            const url           = new URL(window.location.href)

            url.hash            = ''
            url.search          = ''

            return url.href
        }


        // buildInputArgs () : string[] {
        //     return []
        // }
    }

    return ProjectBrowser
}) {}
