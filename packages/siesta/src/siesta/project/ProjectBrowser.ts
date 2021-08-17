import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isNodejs } from "../../util/Helpers.js"
import { EnvironmentType } from "../common/Environment.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeBrowser } from "../runtime/RuntimeBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Project } from "./Project.js"
import { ProjectDescriptorBrowser } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Siesta project for browser code.
 */
export class ProjectBrowser extends Mixin(
    [ Project, ProjectDescriptorBrowser ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorBrowser>) =>

    class ProjectBrowser extends base {
        type                    : EnvironmentType               = 'browser'

        launcherClass           : typeof LauncherBrowser        = LauncherBrowser
        testDescriptorClass     : typeof TestDescriptorBrowser  = TestDescriptorBrowser
        runtimeClass            : typeof Runtime                = RuntimeBrowser

        ui                      : boolean                       = true

        override async launchStandalone () {
            if (isNodejs()) {
                const styles                = (await import("../reporter/styling/theme_universal.js")).styles
                const colorerClass          = (await import('../../jsx/ColorerNodejs.js')).ColorerNodejs
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
    }
) {}
