import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Environment } from "../common/Types.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Project } from "./Project.js"
import { ProjectDescriptorBrowser } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project, ProjectDescriptorBrowser ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorBrowser>) => {

    class ProjectBrowser extends base {
        environment             : Environment                   = 'browser'

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
                projectData             : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments()
            })

            const url           = new URL(window.location.href)

            url.hash            = ''
            url.search          = ''

            launcher.projectData.projectPlan.url  = url.toString().replace(/\/[^/]*?$/, '')

            return launcher
        }
    }

    return ProjectBrowser
}) {}
