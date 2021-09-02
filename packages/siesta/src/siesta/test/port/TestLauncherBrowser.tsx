import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { LauncherNodejs } from "../../launcher/LauncherNodejs.js"
import { SimulatorPlaywrightClient, SimulatorPlaywrightServer } from "../../simulate/SimulatorPlaywright.js"
import { TestLauncherChild, TestLauncherParent } from "./TestLauncher.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherBrowserParent extends Mixin(
    [ TestLauncherParent, SimulatorPlaywrightServer ],
    (base : ClassUnion<typeof TestLauncherParent, typeof SimulatorPlaywrightServer>) =>

    class TestLauncherBrowserParent extends base {
        launcher        : LauncherNodejs

        // @ts-expect-error
        get page () {
            return this.launcher.dashboardPage
        }
        set page (value) {
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherBrowserChild extends Mixin(
    [ TestLauncherChild, SimulatorPlaywrightClient ],
    (base : ClassUnion<typeof TestLauncherChild, typeof SimulatorPlaywrightClient>) =>

    class TestLauncherBrowserChild extends base {

    }
) {}
