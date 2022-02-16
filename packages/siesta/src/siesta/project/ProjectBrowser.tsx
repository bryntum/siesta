import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { isNodejs } from "../../util/Helpers.js"
import { EnvironmentType } from "../common/Environment.js"
import { ExitCodes } from "../launcher/Types.js"
import { ConsoleXmlRenderer } from "../reporter/ConsoleXmlRenderer.js"
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
                const renderer              = ConsoleXmlRenderer.new({
                    doPrint         : str => process.stdout.write(str),
                    styles          : (await import("../reporter/styling/theme_universal.js")).styles,
                    colorerClass    : (await import('../../jsx/ColorerNodejs.js')).ColorerNodejs
                })

                renderer.write(
                    <div>
                        <span class="exception_icon"> ERROR </span> Browser project launched directly as Node.js script.{ '\n' }
                        Please use Siesta launcher instead and web url:{ '\n' }
                        <span class="accented">  npx siesta http://web_path/to/your/project.js</span>
                    </div>
                )

                process.exitCode            = ExitCodes.INCORRECT_ENVIRONMENT
            }
            else
                return super.launchStandalone()
        }
    }
) {}
