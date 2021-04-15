import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextBrowser } from "../../context/ExecutionContextBrowser.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { isNodejs, prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { styles } from "../reporter/styling/terminal.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorBrowser } from "./TestDescriptorBrowser.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestBrowser extends Mixin(
    [
        Test
    ],
    (base : ClassUnion<
        typeof Test
    >) => {

    class TestBrowser extends base {
        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass     : typeof TestDescriptorBrowser

        // @prototypeValue(ExecutionContextBrowser)
        // executionContextClass   : typeof ExecutionContext


        static async getIsomorphicTestClass () : Promise<typeof Test> {
            return this
        }


        static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
            return ExecutionContextBrowser
        }


        static async getLauncherClass () : Promise<typeof Launcher> {
            return (await import('../launcher/LauncherBrowser.js')).LauncherBrowser
        }


        // TODO refactor the whole launching infrastructure
        static async launchStandalone () {
            if (isNodejs()) {
                const colorerClass          = (await import('../../jsx/ColorerNodejs.js')).ColorerNodejs
                const c                     = colorerClass.new()
                const style                 = (clsName : string) => styles.get(clsName)(c)

                console.log(
`${ style('exception_icon').text(' ERROR ') } Browser test launched directly as Node.js script.
Please use Siesta launcher instead and web url:
  ${ style('accented').text('npx siesta http://web_path/to/your/test.js') }`
                )

                return
            } else
                super.launchStandalone()
        }
    }

    return TestBrowser

}) {}


//---------------------------------------------------------------------------------------------------------------------
export const { it, iit, xit, describe, ddescribe, xdescribe } = createTestSectionConstructors(TestBrowser)
