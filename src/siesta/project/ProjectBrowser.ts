import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { isNodejs } from "../../util/Helpers.js"
import { stripBasename } from "../../util/Path.js"
import { EnvironmentType } from "../common/Environment.js"
import { Launch } from "../launcher/Launch.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Project } from "./Project.js"
import { ProjectDescriptorBrowser } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Siesta project for browser code.
 */
export class ProjectBrowser extends Mixin(
    [ Project, ProjectDescriptorBrowser ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorBrowser>) => {

    class ProjectBrowser extends base {
        type                    : EnvironmentType               = 'browser'

        launcherClass           : typeof LauncherBrowser        = LauncherBrowser
        testDescriptorClass     : typeof TestDescriptorBrowser  = TestDescriptorBrowser


        buildBaseUrl () : string {
            const url           = new URL(window.location.href)

            url.hash            = ''
            url.search          = ''

            return url.href
        }


        buildInputArguments () : string[] {
            // TODO should extract search params from location.href here
            return []
        }


        async getIsomorphicSelfInstance () : Promise<ProjectBrowser> {
            return this
        }


        async launchStandalone () : Promise<Launch> {
            if (isNodejs()) {
                const styles                = (await import("../reporter/styling/theme_universal.js")).styles
                const colorerClass          = (await import('../../jsx/ColorerNodejs.js'))[ 'ColorerNodejs' ] as typeof ColorerNodejs
                const c                     = colorerClass.new()
                const style                 = (clsName : string) => styles.get(clsName)(c)

                console.log(
`${ style('exception_icon').text(' ERROR ') } Browser project launched directly as Node.js script.
Please use Siesta launcher instead and web url:
  ${ style('accented').text('npx siesta http://web_path/to/your/project.js') }`
                )

                return
            }

            return super.launchStandalone()
        }


        getStandaloneLauncher () : LauncherBrowser {
            const launcher = this.launcherClass.new({
                projectData             : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments()
            })

            const url           = new URL(window.location.href)

            url.hash            = ''
            url.search          = ''

            launcher.projectData.projectPlan.url  = stripBasename(url.toString())

            return launcher
        }
    }

    return ProjectBrowser
}) {}
