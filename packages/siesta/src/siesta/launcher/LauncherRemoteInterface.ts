import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { local, remote } from "../../rpc/port/Port.js"
import { PortHandshakeChild } from "../../rpc/port/PortHandshake.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { SubTestCheckInfo } from "../test/TestResult.js"
import { LauncherDescriptor } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export interface LauncherRemoteInterface {
    startDashboard (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptor) : Promise<any>

    doLaunchContinuously (projectPlanItemsToLaunch : TestDescriptor[]) : Promise<any>

    doLaunchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) : Promise<any>
}


//---------------------------------------------------------------------------------------------------------------------
export class LauncherRemoteClient extends Mixin(
    [ PortHandshakeChild, Base ],
    (base : ClassUnion<typeof PortHandshakeChild, typeof Base>) =>

    class LauncherRemoteClient extends base implements LauncherRemoteInterface {
        @local()
        async startDashboard (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptor) {
        }


        @remote()
        doLaunchContinuously : (projectPlanItemsToLaunch : TestDescriptor[]) => Promise<any>


        @remote()
        doLaunchContinuouslyWithCheckInfo : (desc : TestDescriptor, checkInfo : SubTestCheckInfo) => Promise<any>
    }
) {}
