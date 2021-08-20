import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { remote } from "../../rpc/port/Port.js"
import { PortHandshakeChild } from "../../rpc/port/PortHandshake.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { SubTestCheckInfo } from "../test/TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
export interface LauncherRemoteInterface {
    launchContinuously (projectPlanItemsToLaunch : TestDescriptor[]) : Promise<any>

    launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) : Promise<any>
}


//---------------------------------------------------------------------------------------------------------------------
export class LauncherRemoteClient extends Mixin(
    [ PortHandshakeChild, Base ],
    (base : ClassUnion<typeof PortHandshakeChild, typeof Base>) =>

    class LauncherRemoteClient extends base implements LauncherRemoteInterface {

        @remote()
        launchContinuously : (projectPlanItemsToLaunch : TestDescriptor[]) => Promise<any>


        @remote()
        launchContinuouslyWithCheckInfo : (desc : TestDescriptor, checkInfo : SubTestCheckInfo) => Promise<any>
    }
) {}
