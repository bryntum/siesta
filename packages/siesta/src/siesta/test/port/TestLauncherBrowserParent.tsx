import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { ContextPlaywright } from "../../context/ContextPlaywright.js"
import { LauncherNodejs } from "../../launcher/LauncherNodejs.js"
import { SimulatorPlaywrightServer } from "../../simulate/SimulatorPlaywright.js"
import { TestLauncherParent } from "./TestLauncherParent.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherBrowserDashboardParent extends Mixin(
    [ TestLauncherParent, SimulatorPlaywrightServer ],
    (base : ClassUnion<typeof TestLauncherParent, typeof SimulatorPlaywrightServer>) =>

    class TestLauncherBrowserDashboardParent extends base {
        launcher        : LauncherNodejs

        // @ts-expect-error
        get page () {
            return this.launcher.dashboardPage
        }
        set page (value) {
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherBrowserPlaywrightParent extends Mixin(
    [ TestLauncherParent, SimulatorPlaywrightServer ],
    (base : ClassUnion<typeof TestLauncherParent, typeof SimulatorPlaywrightServer>) =>

    class TestLauncherBrowserPlaywrightParent extends base {
        launcher        : LauncherNodejs
        context         : ContextPlaywright

        // @ts-expect-error
        get page () {
            return this.context.page
        }
        set page (value) {
        }
    }
) {}


