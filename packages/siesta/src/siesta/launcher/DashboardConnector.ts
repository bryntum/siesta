import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { ComponentElement } from "../../chronograph-jsx/ElementReactivity.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { local, remote } from "../../rpc/port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { IsolationLevel } from "../common/IsolationLevel.js"
import { LUID } from "../common/LUID.js"
import { ContextProviderBrowserIframe } from "../context/context_provider/ContextProviderBrowserIframe.js"
import { ContextBrowserIframe } from "../context/ContextBrowserIframe.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { Point } from "../simulate/Types.js"
import { TestReporterChild } from "../test/port/TestReporterChild.js"
import { TestReporter } from "../test/port/TestReporterParent.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { AssertionAsyncResolution, SubTestCheckInfo, TestResultLeaf } from "../test/TestResult.js"
import { TestNodeResultReactive } from "../test/TestResultReactive.js"
import { Dashboard } from "../ui/Dashboard.js"
import { Translator } from "../ui/test_result/Translator.js"
import { LaunchState, TestLaunchInfo } from "../ui/TestLaunchInfo.js"
import { Launcher, LauncherDescriptor } from "./Launcher.js"
import { LauncherDescriptorNodejs } from "./LauncherDescriptorNodejs.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DashboardLaunchInfo = {
    offset      : Point
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DashboardConnectorInterface {
    startDashboard (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptor) : Promise<any>

    setLaunchState (desc : TestDescriptor, launchState : LaunchState) : Promise<DashboardLaunchInfo | undefined>

    launchContinuously (projectPlanItemsToLaunch : TestDescriptor[], isolationOverride? : IsolationLevel) : Promise<any>

    launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) : Promise<any>

    fetchSources (url : string) : Promise<string[]>

    createIframeContext (desc : TestDescriptor) : Promise<LUID>

    iframeContextEvaluateBasic <A extends unknown[], R extends unknown> (contextId : LUID, func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>>

    // iframeContextNavigate (contextId : LUID, url : string) : Promise<any>

    iframeContextDestroy (contextId : LUID) : Promise<any>

    onBeforeUnload () : Promise<any>

    // // not used
    // iframeContextDestroyAll () : Promise<any>
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DashboardConnectorServer extends Mixin(
    [ TestReporterChild, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterChild, typeof PortHandshakeParent, typeof Base>) =>

    class DashboardConnectorServer extends base implements DashboardConnectorInterface {
        launcher            : Launcher          = undefined

        @local()
        async onBeforeUnload () : Promise<any> {
            this.launcher.isClosingDashboard    = true
            // de-referencing the dashboard connector immediately
            // so that `TestReporter`s won't try to report any result it
            // this allows us to reload the dashboard while a test is running
            this.launcher.dashboardConnector    = undefined
        }


        @remote()
        startDashboard : (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptor) => Promise<any>


        @local()
        async launchContinuously (projectPlanItemsToLaunch : TestDescriptor[], isolationOverride? : IsolationLevel) {
            this.launcher.launchContinuously(
                projectPlanItemsToLaunch
                    // TODO remove after scoped serialization will be back
                    .map(desc => this.launcher.dispatcher.resultsMappingById.get(desc.guid).descriptor),
                isolationOverride
            )
        }


        @local()
        async launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) {
            this.launcher.launchContinuouslyWithCheckInfo(
                // TODO remove after scoped serialization will be back
                [ desc ].map(desc => this.launcher.dispatcher.resultsMappingById.get(desc.guid).descriptor)[ 0 ],
                checkInfo
            )
        }


        @local()
        async fetchSources (url : string) : Promise<string[]> {
            return this.launcher.reporter.fetchSources(url)
        }


        @remote()
        setLaunchState : (desc : TestDescriptor, launchState : LaunchState) => Promise<DashboardLaunchInfo | undefined>


        @remote()
        createIframeContext : (desc : TestDescriptor) => Promise<LUID>


        @remote()
        iframeContextEvaluateBasic : <A extends unknown[], R extends unknown>(contextId : LUID, func : (...args : A) => R, ...args : A) => Promise<UnwrapPromise<R>>


        // @remote()
        // iframeContextNavigate : (contextId : LUID, url : string) => Promise<any>


        @remote()
        iframeContextDestroy : (contextId : LUID) => Promise<any>


        // @remote()
        // iframeContextDestroyAll : () => Promise<any>
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DashboardConnectorClient extends Mixin(
    [ PortHandshakeChild, Base ],
    (base : ClassUnion<typeof PortHandshakeChild, typeof Base>) =>

    class DashboardConnectorClient extends base implements DashboardConnectorInterface, TestReporter {
        dashboard                   : Dashboard         = undefined

        iframeContextProvider       : ContextProviderBrowserIframe  = ContextProviderBrowserIframe.new()

        iframeContexts              : Map<LUID, [ LUID, ContextBrowserIframe ]>     = new Map()
        iframeContextsByDescId      : Map<LUID, ContextBrowserIframe>               = new Map()


        // region DashboardConnectorInterface
        @local()
        async startDashboard (data : ProjectSerializableData, launcherDescriptor : LauncherDescriptorNodejs) {
            this.dashboard.projectData        = data
            this.dashboard.launcherDescriptor = launcherDescriptor

            await this.dashboard.start()
        }


        @local()
        async setLaunchState (desc : TestDescriptor, launchState : LaunchState) : Promise<DashboardLaunchInfo | undefined> {
            const launchInfo        = this.dashboard.mapping.get(desc.guid)

            launchInfo.launchState  = launchState

            const context           = this.iframeContextsByDescId.get(launchInfo.descriptor.guid)

            if (desc.isRunningInDashboard()) {
                if (launchState === 'started') {
                    if (context) {
                        this.dashboard.overlay.context = context

                        globalGraph.commit()

                        const translatorEl  = this.dashboard.overlay.el.querySelector('.translator') as ComponentElement<Translator>
                        const translator    = translatorEl.comp

                        translator.syncPosition()

                        const style         = translator.targetElement.style

                        return { offset : [ Number.parseInt(style.left), Number.parseInt(style.top) ] }
                    }
                }
                else if (launchState === 'completed') {
                    this.dashboard.overlay.context      = null

                    if (context) launchInfo.context  = context
                }
            } else {
                // destroy any possible previous in-dashboard context
                if (context && launchState === 'started') await this.iframeContextDestroy(context.id)
            }
        }


        @remote()
        launchContinuously : (projectPlanItemsToLaunch : TestDescriptor[], isolationOverride? : IsolationLevel) => Promise<any>


        @remote()
        launchContinuouslyWithCheckInfo : (desc : TestDescriptor, checkInfo : SubTestCheckInfo) => Promise<any>


        @remote()
        onBeforeUnload : () => Promise<any>


        @remote()
        fetchSources : (url : string) => Promise<string[]>
        // endregion

        @local()
        async createIframeContext (desc : TestDescriptor) : Promise<LUID> {
            const context       = await this.iframeContextProvider.createContext(desc)

            this.iframeContexts.set(context.id, [ desc.guid, context ])
            this.iframeContextsByDescId.set(desc.guid, context)

            return context.id
        }


        @local()
        iframeContextEvaluateBasic <A extends unknown[], R extends unknown> (
            contextId : LUID, func : (...args : A) => R, ...args : A
        )
            : Promise<UnwrapPromise<R>>
        {
            const data       = this.iframeContexts.get(contextId)

            if (!data) throw new Error(`No context with id ${ contextId } available`)

            return data[ 1 ].evaluateBasic(func, ...args)
        }


        @local()
        async iframeContextDestroy (contextId : LUID) {
            const data       = this.iframeContexts.get(contextId)

            if (!data) throw new Error(`No context with id ${ contextId } available`)

            await data[ 1 ].destroy()

            this.iframeContexts.delete(contextId)
            this.iframeContextsByDescId.delete(data[ 0 ])

            const launchInfo        = this.dashboard.mapping.get(data[ 0 ])
            launchInfo.context      = undefined
        }


        // @local()
        // async iframeContextDestroyAll () {
        //     await Promise.all(Array.from(this.iframeContexts.values()).map(context => context.destroy()))
        //
        //     this.iframeContexts.clear()
        // }


        // @local()
        // async iframeContextNavigate (contextId : LUID, url : string) {
        //
        // }


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
