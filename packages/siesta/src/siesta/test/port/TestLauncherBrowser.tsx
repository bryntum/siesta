import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { ContextPlaywright } from "../../context/ContextPlaywright.js"
import { LauncherNodejs } from "../../launcher/LauncherNodejs.js"
import { SimulatorPlaywrightClient, SimulatorPlaywrightServer } from "../../simulate/SimulatorPlaywright.js"
import { TestLauncherChild, TestLauncherParent } from "./TestLauncher.js"


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
export class TestLauncherBrowserDashboardChild extends Mixin(
    [ TestLauncherChild, SimulatorPlaywrightClient ],
    (base : ClassUnion<typeof TestLauncherChild, typeof SimulatorPlaywrightClient>) =>

    class TestLauncherBrowserDashboardChild extends base {
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherBrowserPlaywrightChild extends Mixin(
    [ TestLauncherChild, SimulatorPlaywrightClient ],
    (base : ClassUnion<typeof TestLauncherChild, typeof SimulatorPlaywrightClient>) =>

    class TestLauncherBrowserPlaywrightChild extends base {
    }
) {}
