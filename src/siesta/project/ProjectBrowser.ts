import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Launcher } from "../launcher/Launcher.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { TestDescriptorBrowser } from "../test/DescriptorBrowser.js"
import { Project } from "./Project.js"
import { ProjectOptionsBrowser } from "./ProjectOptions.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project, ProjectOptionsBrowser ],
    (base : ClassUnion<typeof Project, typeof ProjectOptionsBrowser>) => {

    class ProjectBrowser extends base {

        launcherClass           : typeof Launcher           = LauncherBrowser
        testDescriptorClass     : typeof TestDescriptor     = TestDescriptorBrowser


        // buildBaseUrl () : string {
        //     const url           = new URL(window.location.href)
        //
        //     url.hash            = ''
        //     url.search          = ''
        //
        //     return url.href
        // }


        buildInputArguments () : string[] {
            // TODO should extract search params from location.href here
            return []
        }
    }

    return ProjectBrowser
}) {}
