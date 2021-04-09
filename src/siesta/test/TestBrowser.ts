import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { isNodejs, prototypeValue } from "../../util/Helpers.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
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
        @prototypeValue(LauncherBrowser)
        launcherClass           : typeof LauncherBrowser

        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass     : typeof TestDescriptorBrowser


        static async getIsomorphicTestClass () : Promise<typeof Test> {
            return this
        }


        // TODO refactor the whole launching infrastructure
        static async launchStandalone () {
            if (isNodejs()) {
                // TODO actually implement standalone browser launching

                const colorerClass          = (await import('../../jsx/ColorerNodejs.js'))[ 'ColorerNodejs' ] as typeof ColorerNodejs
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
