import { ClassUnion, Mixin } from "typescript-mixin-class"
import { SimulatorPlaywrightClient } from "../../simulate/SimulatorPlaywright.js"
import { TestLauncherChild } from "./TestLauncherChild.js"

// IMPORTANT: Note, that this side of the `TestLauncher` interface is placed into its own file
// this is to keep the test bundle small and free from parent-side dependencies


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherBrowserDashboardChild extends Mixin(
    [ TestLauncherChild, SimulatorPlaywrightClient ],
    (base : ClassUnion<typeof TestLauncherChild, typeof SimulatorPlaywrightClient>) =>

    class TestLauncherBrowserDashboardChild extends base {
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherBrowserPlaywrightChild extends Mixin(
    [ TestLauncherChild, SimulatorPlaywrightClient ],
    (base : ClassUnion<typeof TestLauncherChild, typeof SimulatorPlaywrightClient>) =>

    class TestLauncherBrowserPlaywrightChild extends base {
    }
) {}
