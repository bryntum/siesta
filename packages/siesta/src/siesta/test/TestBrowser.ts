import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextBrowser } from "../../context/ExecutionContextBrowser.js"
import { isNodejs, prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { Simulator } from "../simulate/Simulator.js"
import { UserAgentOnPage } from "../simulate/UserAgent.js"
import { TestLauncherBrowserChild } from "./port/TestLauncherBrowser.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorBrowser } from "./TestDescriptorBrowser.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Test class for code running in the browser environment.
 */
export class TestBrowser extends Mixin(
    [
        UserAgentOnPage,
        Test
    ],
    (base : ClassUnion<
        typeof UserAgentOnPage,
        typeof Test
    >) =>

    class TestBrowser extends base {
        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass     : typeof TestDescriptorBrowser

        // @prototypeValue(ExecutionContextBrowser)
        // executionContextClass   : typeof ExecutionContext

        connector           : TestLauncherBrowserChild

        // @ts-expect-error
        get simulator () : Simulator {
            return this.connector
        }
        set simulator (value : Simulator) {
        }


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
                const styles                = (await import("../reporter/styling/theme_universal.js")).styles
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

) {}


//---------------------------------------------------------------------------------------------------------------------
export const {
    /**
     * Alias for {@link TestBrowser.it | it} method.
     */
    it,

    /**
     * Alias for {@link TestBrowser.iit | iit} method.
     */
    iit,

    /**
     * Alias for {@link TestBrowser.xit | xit} method.
     */
    xit,

    /**
     * Alias for {@link TestBrowser.describe | describe} method.
     */
    describe,

    /**
     * Alias for {@link TestBrowser.ddescribe | ddescribe} method.
     */
    ddescribe,

    /**
     * Alias for {@link TestBrowser.xdescribe | xdescribe} method.
     */
    xdescribe
} = createTestSectionConstructors(TestBrowser)
