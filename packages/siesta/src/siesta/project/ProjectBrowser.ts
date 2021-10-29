import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isNodejs } from "../../util/Helpers.js"
import { EnvironmentType } from "../common/Environment.js"
import { ExitCodes } from "../launcher/Types.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeBrowser } from "../runtime/RuntimeBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Project } from "./Project.js"
import { ProjectDescriptorBrowser } from "./ProjectDescriptorBrowser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Siesta project for browser code.
 */
export class ProjectBrowser extends Mixin(
    [ Project, ProjectDescriptorBrowser ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorBrowser>) =>

    class ProjectBrowser extends base {
        type                    : EnvironmentType               = 'browser'

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

                process.exitCode            = ExitCodes.INCORRECT_ENVIRONMENT

                return
            }

            return super.launchStandalone()
        }
    }
) {}
