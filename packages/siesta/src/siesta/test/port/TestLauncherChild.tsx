import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { parse } from "typescript-serializable-mixin"
import { local } from "../../../rpc/port/Port.js"
import { PortHandshakeChild } from "../../../rpc/port/PortHandshake.js"
import { DashboardLaunchInfo } from "../../launcher/DashboardConnector.js"
import { globalTestEnv, Test } from "../Test.js"
import { SubTestCheckInfo } from "../TestResult.js"
import { TestLauncher } from "./TestLauncherParent.js"
import { TestReporterChild } from "./TestReporterChild.js"

// IMPORTANT: Note, that this side of the `TestLauncher` interface is placed into its own file
// this is to keep the test bundle small and free from parent-side dependencies


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, PortHandshakeChild, Base ],
    (base : ClassUnion<typeof TestReporterChild, typeof PortHandshakeChild, typeof Base>) =>

    class TestLauncherChild extends base implements TestLauncher {

        @local()
        async launchTest (testDescriptorStr : string, checkInfo : SubTestCheckInfo, dashboardLaunchInfo : DashboardLaunchInfo) {
            // there might be no `topTest` if test file does not contain any calls
            // to static `it` method of any test class
            const topTest = globalTestEnv.topTest || Test.new({
                descriptor      : parse(testDescriptorStr)
            })

            topTest.connector    = this

            await topTest.start(checkInfo, dashboardLaunchInfo)

            globalTestEnv.clear()
        }
    }
) {}
