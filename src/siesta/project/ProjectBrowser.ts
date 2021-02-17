import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Project } from "./Project.js"
import { ProjectOptionsBrowser } from "./ProjectOptions.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project, ProjectOptionsBrowser ],
    (base : ClassUnion<typeof Project, typeof ProjectOptionsBrowser>) => {

    class ProjectBrowser extends base {

        launcherClass           : typeof LauncherBrowser        = LauncherBrowser
        testDescriptorClass     : typeof TestDescriptorBrowser  = TestDescriptorBrowser


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


        getStandaloneLauncher () : LauncherBrowser {
            const launcher = this.launcherClass.new({
                projectDescriptor       : this.asProjectDescriptor(),

                inputArguments          : this.buildInputArguments()
            })

            const url           = new URL(window.location.href)

            url.hash            = ''
            url.search          = ''

            launcher.projectDescriptor.projectPlan.url  = url.toString().replace(/\/[^/]*?$/, '')

            return launcher
        }
    }

    return ProjectBrowser
}) {}
