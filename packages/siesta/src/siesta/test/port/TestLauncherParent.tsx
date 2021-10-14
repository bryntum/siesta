import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { remote } from "../../../rpc/port/Port.js"
import { PortHandshakeParent } from "../../../rpc/port/PortHandshake.js"
import { Context } from "../../context/Context.js"
import { DashboardLaunchInfo } from "../../launcher/DashboardConnector.js"
import { Launcher } from "../../launcher/Launcher.js"
import { SubTestCheckInfo } from "../TestResultReactive.js"
import { TestReporterParent } from "./TestReporterParent.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface TestLauncher {
    launchTest (testDescriptorStr : string, checkInfo : SubTestCheckInfo, dashboardLaunchInfo : DashboardLaunchInfo) : Promise<any>
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterParent, typeof PortHandshakeParent, typeof Base>) =>

    class TestLauncherParent extends base implements TestLauncher {
        launcher        : Launcher          = undefined

        context         : Context           = undefined

        @remote()
        launchTest : (testDescriptorStr : string, checkInfo : SubTestCheckInfo, dashboardLaunchInfo : DashboardLaunchInfo) => Promise<any>
    }
) {}


