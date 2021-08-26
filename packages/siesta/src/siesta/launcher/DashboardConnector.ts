import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { local, remote } from "../../rpc/port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { LUID } from "../common/LUID.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { TestReporter, TestReporterChild, TestReporterParent } from "../test/port/TestReporter.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { AssertionAsyncResolution, SubTestCheckInfo, TestNodeResultReactive, TestResultLeaf } from "../test/TestResult.js"
import { Dashboard } from "../ui/Dashboard.js"
import { LaunchState, TestLaunchInfo } from "../ui/TestLaunchInfo.js"
import { Launcher, LauncherDescriptor } from "./Launcher.js"
import { LauncherDescriptorNodejs } from "./LauncherDescriptorNodejs.js"


//---------------------------------------------------------------------------------------------------------------------
export interface DashboardConnectorInterface {
    startDashboard (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptor) : Promise<any>

    setLaunchState (rootTestId : LUID, launchState : LaunchState) : Promise<any>

    launchContinuously (projectPlanItemsToLaunch : TestDescriptor[]) : Promise<any>

    launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) : Promise<any>

    fetchSources (url : string) : Promise<string[]>
}


//---------------------------------------------------------------------------------------------------------------------
export class DashboardConnectorServer extends Mixin(
    [ TestReporterChild, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterChild, typeof PortHandshakeParent, typeof Base>) =>

    class DashboardConnectorServer extends base implements DashboardConnectorInterface {
        launcher            : Launcher          = undefined


        @remote()
        startDashboard : (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptor) => Promise<any>


        @local()
        async launchContinuously (projectPlanItemsToLaunch : TestDescriptor[]) {
            this.launcher.launchContinuously(projectPlanItemsToLaunch)
        }


        @local()
        async launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) {
            this.launcher.launchContinuouslyWithCheckInfo(desc, checkInfo)
        }


        @local()
        async fetchSources (url : string) : Promise<string[]> {
            return this.launcher.reporter.fetchSources(url)
        }


        @remote()
        setLaunchState : (rootTestId : LUID, launchState : LaunchState) => Promise<any>
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class DashboardConnectorClient extends Mixin(
    [ PortHandshakeChild, Base ],
    (base : ClassUnion<typeof PortHandshakeChild, typeof Base>) =>

    class DashboardConnectorClient extends base implements DashboardConnectorInterface, TestReporter {
        dashboard           : Dashboard         = undefined

        // region DashboardConnectorInterface
        @local()
        async startDashboard (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptorNodejs) {
            this.dashboard.projectData        = data
            this.dashboard.launcherDescriptor = launcherDescriptor

            await this.dashboard.start()
        }


        @local()
        async setLaunchState (rootTestId : LUID, launchState : LaunchState) {
            const launchInfo        = this.dashboard.mapping.get(rootTestId)

            launchInfo.launchState  = launchState
        }


        @remote()
        launchContinuously : (projectPlanItemsToLaunch : TestDescriptor[]) => Promise<any>


        @remote()
        launchContinuouslyWithCheckInfo : (desc : TestDescriptor, checkInfo : SubTestCheckInfo) => Promise<any>


        @remote()
        fetchSources : (url : string) => Promise<string[]>
        // endregion


        // region TestReporter
        @local()
        async onSubTestStart (rootTestId : LUID, testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor) {
            if (parentTestNodeId === null) {
                const launchInfo    = this.dashboard.mapping.get(rootTestId)

                const newNode       = TestNodeResultReactive.new({
                    localId         : testNodeId,
                    descriptor      : descriptor,
                    state           : 'running',

                    previous        : launchInfo.mostRecentResult
                })

                launchInfo.mostRecentResult     = launchInfo.currentTestNodeResult = newNode
                launchInfo.launchState          = 'running'

            } else {
                const launchInfo : TestLaunchInfo = this.dashboard.mapping.get(rootTestId)

                if (launchInfo.currentTestNodeResult.localId !== parentTestNodeId) {
                    throw new Error("Parent test node internal id mismatch")
                }

                const newNode       = TestNodeResultReactive.new({
                    localId         : testNodeId,
                    descriptor      : descriptor,
                    state           : 'running',

                    parentNode      : launchInfo.currentTestNodeResult
                })

                launchInfo.currentTestNodeResult.addResult(newNode)

                const previousChildResultsIndex     = launchInfo.currentTestNodeResult.previous?.childResultsIndex

                if (previousChildResultsIndex) {
                    const currentIndex      = launchInfo.currentTestNodeResult.childResultsIndex
                    const newNodeId         = currentIndex.childToId.get(newNode)
                    const previousNode      = previousChildResultsIndex.idToChild.get(newNodeId)

                    if (previousNode) {
                        newNode.previous = previousNode
                        newNode.syncFromPrevious()
                    }
                }

                launchInfo.currentTestNodeResult  = newNode
            }
        }

        @local()
        async onSubTestFinish (rootTestId : LUID, testNodeId : LUID, isIgnored : boolean) {
            const launchInfo : TestLaunchInfo = this.dashboard.mapping.get(rootTestId)

            if (!launchInfo.currentTestNodeResult || launchInfo.currentTestNodeResult.localId !== testNodeId) {
                throw new Error("No current test node or test node id mismatch")
            }

            launchInfo.currentTestNodeResult.frozen   = true
            launchInfo.currentTestNodeResult.state    = isIgnored ? 'ignored' : 'completed'

            launchInfo.currentTestNodeResult          = launchInfo.currentTestNodeResult.parentNode
        }


        @local()
        async onResult (rootTestId : LUID, testNodeId : LUID, result : TestResultLeaf) {
            const launchInfo : TestLaunchInfo = this.dashboard.mapping.get(rootTestId)

            if (!launchInfo.currentTestNodeResult || launchInfo.currentTestNodeResult.localId !== testNodeId) {
                throw new Error("Parent node id mismatch for test result")
            }

            launchInfo.currentTestNodeResult.addResult(result)
        }


        @local()
        async onAssertionFinish (rootTestId : LUID, testNodeId : LUID, assertion : AssertionAsyncResolution) {
            const launchInfo : TestLaunchInfo = this.dashboard.mapping.get(rootTestId)

            if (!launchInfo.currentTestNodeResult || launchInfo.currentTestNodeResult.localId !== testNodeId) {
                throw new Error("Parent node id mismatch for asynchronous test result finalization")
            }

            launchInfo.currentTestNodeResult.addAsyncResolution(assertion)
        }
        // endregion
    }
) {}
