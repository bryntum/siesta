import { AnyFunction } from "typescript-mixin-class/src/class/Mixin.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { importer } from "../../Importer.js"
import { Logger } from "../../logger/Logger.js"
import { MediaSameContext } from "../../rpc/media/MediaSameContext.js"
import { stringify } from "../../serializable/Serializable.js"
import { IsolationLevel } from "../common/IsolationLevel.js"
import { LUID, luid } from "../common/LUID.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestLauncherChild } from "../test/port/TestLauncherChild.js"
import { TestLauncherParent } from "../test/port/TestLauncherParent.js"
import { Test } from "../test/Test.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { Exception, SubTestCheckInfo } from "../test/TestResult.js"
import { TestNodeResultReactive } from "../test/TestResultReactive.js"
import { LaunchState } from "../ui/TestLaunchInfo.js"
import { DashboardLaunchInfo } from "./DashboardConnector.js"
import { Launcher } from "./Launcher.js"
import { Queue } from "./Queue.js"
import { TestLaunchResult } from "./TestLaunchResult.js"
import { ExitCodes } from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type LauncherConnectorClassLocator = {
    server : {
        launcherConnectorClass : typeof TestLauncherParent
    }
    client : {
        importerUrl         : string
        symbol              : string
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class CleanupSlot extends Base {
    task                : AnyFunction<Promise<any>>         = undefined

    state               : 'keep' | 'dispose'                = 'keep'


    async setTask (task : AnyFunction<Promise<any>>) {
        if (this.state === 'keep')
            this.task = task
        else
            await task()
    }


    async dispose () {
        this.state  = 'dispose'

        if (this.task) {
            await this.task()

            this.task   = undefined
        }
    }
}

// only had to export it because of declarations files generation
export class CleanupQueue extends Base {
    dispatcher          : Dispatcher                        = undefined

    order               : TestDescriptor[]                  = []

    slots               : Map<TestDescriptor, CleanupSlot>  = new Map()


    get keepNLastResults () : number {
        return this.dispatcher.launcher.keepNLastResults
    }


    async reserveCleanupSlot (desc : TestDescriptor) {
        const existing      = this.slots.get(desc)

        if (existing) {
            await this.extractSlot(desc).dispose()
        }

        while (this.slots.size > Math.max(this.keepNLastResults - 1, 0)) {
            await this.extractSlot(this.order[ 0 ]).dispose()
        }

        const slot          = CleanupSlot.new()

        this.slots.set(desc, slot)
        this.order.push(desc)

        if (this.keepNLastResults === 0) slot.state = 'dispose'

        return slot
    }


    extractSlot (desc : TestDescriptor) : CleanupSlot | undefined {
        const slot      = this.slots.get(desc)

        if (slot) {
            this.slots.delete(desc)

            this.order.splice(this.order.indexOf(desc), 1)
        }

        return slot
    }


    async clearAll () {
        const slots         = Array.from(this.slots.values())

        this.slots.clear()
        this.order.length   = 0

        // this swallows the exceptions
        await Promise.allSettled(slots.map(slot => slot.dispose()))
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Dispatcher extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Dispatcher extends base {
        cleanupQueue                : CleanupQueue              = CleanupQueue.new({ dispatcher : this })

        launcher                    : Launcher                  = undefined

        runningQueue                : Queue                     = undefined

        pendingQueue                : {
            order       : TestDescriptor[],
            presence    : Map<TestDescriptor, { checkInfo : SubTestCheckInfo | undefined, isolationOverride : IsolationLevel }>
        }                                                       = { order : [], presence : new Map() }

        projectPlanLaunchResult     : TestLaunchResult          = undefined

        resultsMappingById          : Map<LUID, TestLaunchResult>               = new Map()
        // resultsMapping              : Map<TestDescriptor, TestLaunchResult>     = new Map()

        projectPlanItemsToLaunch    : TestDescriptor[]          = []

        contextProviders            : ContextProvider[]         = []

        exitCode                    : ExitCodes                 = undefined

        // make sure we actually import these class symbols (and not just types),
        // so that their `registerSerializableClass()` calls are made
        // this is so that TestLauncher interface to work correctly, since it is serializing the
        // test descriptor in it's methods arguments
        descriptorClassesToImport   : (typeof TestDescriptor)[] = [
            TestDescriptor,
            // IMPORTANT the following classes are assumed to be isomorphic by themselves
            // (even that they represent the data for non-isomorphic classes)
            TestDescriptorNodejs,
            TestDescriptorDeno,
            TestDescriptorBrowser
        ]


        initialize (props? : Partial<Dispatcher>) {
            super.initialize(props)

            this.runningQueue   = Queue.new({ maxWorkers : this.maxWorkers })

            this.runningQueue.onFreeSlotAvailableHook.on(queue => {
                const desc      = this.shiftPendingTest()

                if (desc) queue.push(desc[ 0 ], this.launchProjectPlanItem(desc[ 0 ], desc[ 1 ].checkInfo, desc[ 1 ].isolationOverride))
            })

            this.runningQueue.onSlotSettledHook.on(
                (queue, descriptor : TestDescriptor, result : PromiseSettledResult<unknown>) => {
                    if (result.status === 'rejected') this.reportLaunchFailure(descriptor, result.reason)

                    queue.pull()
                }
            )

            this.projectPlanLaunchResult    = TestLaunchResult.fromTreeNode(
                this.launcher.projectData.projectPlan,
                descriptor => {
                    descriptor.guid     = luid()

                    const result        = TestLaunchResult.new({ descriptor })

                    // this.resultsMapping.set(descriptor, result)
                    this.resultsMappingById.set(descriptor.guid, result)

                    return result
                }
            )
        }


        get projectData () : ProjectSerializableData {
            return this.launcher.projectData
        }

        get logger () : Logger {
            return this.launcher.logger
        }

        get reporter () : Reporter {
            return this.launcher.reporter
        }

        get maxWorkers () : number {
            return this.launcher.maxWorkers
        }


        // getTestLaunchInfo (desc : TestDescriptor) : TestLaunchResult {
        //     return this.resultsMapping.get(desc)
        // }


        isCompleted () : boolean {
            return this.pendingQueue.order.length === 0 && this.runningQueue.isEmpty
        }


        addRunOnceBatch (descriptors : TestDescriptor[]) {
            this.projectPlanItemsToLaunch   = descriptors

            descriptors.forEach(desc => this.addPendingTest(desc))
        }


        addPendingTest (desc : TestDescriptor, checkInfo : SubTestCheckInfo = undefined, isolationOverride : IsolationLevel = undefined) {
            const pendingQueue  = this.pendingQueue

            if (pendingQueue.presence.has(desc)) return

            pendingQueue.order.push(desc)
            pendingQueue.presence.set(desc, { checkInfo, isolationOverride })

            this.runningQueue.pull()
        }


        shiftPendingTest () : [ TestDescriptor, { checkInfo : SubTestCheckInfo | undefined, isolationOverride : IsolationLevel } ] | undefined {
            const pendingQueue  = this.pendingQueue

            if (pendingQueue.order.length === 0) return undefined

            const desc          = pendingQueue.order.shift()
            const checkInfo     = pendingQueue.presence.get(desc)

            pendingQueue.presence.delete(desc)

            return [ desc, checkInfo ]
        }


        reportLaunchFailure (descriptor : TestDescriptor, exception : any) {
            this.logger.error(`Exception when running ${ descriptor.flatten.url }\n`, exception?.stack || exception)
        }


        beforeTestLaunch (desc : TestDescriptor) {
            this.reporter.onBeforeTestLaunch(desc)
        }


        async setDashboardLaunchState (desc : TestDescriptor, launchState : LaunchState) : Promise<DashboardLaunchInfo | undefined> {
            return this.launcher.dashboardConnector?.setLaunchState(desc, launchState)
        }


        chooseContextProviderFor (desc : TestDescriptor) : ContextProvider {
            if (this.launcher.dashboardConnector && desc.type === 'browser' && (desc.isolation === 'iframe' || desc.isolation === 'context')) {
                // in pure-browser mode there's only 1 context provider
                return this.contextProviders[ 1 ] || this.contextProviders[ 0 ]
            } else {
                return this.contextProviders[ 0 ]
            }
        }


        async launchProjectPlanItem (item : TestDescriptor, checkInfo : SubTestCheckInfo = undefined, isolationOverride : IsolationLevel = undefined) {
            const slot              = await this.cleanupQueue.reserveCleanupSlot(item)

            // clear the `flatten` cache, because we modify it below (isolationOverride)
            item.$flatten           = undefined
            const normalized        = item.flatten
            if (isolationOverride) normalized.isolation = isolationOverride

            this.logger.debug("Launching project item: ", normalized.url)

            this.beforeTestLaunch(normalized)

            const launchInfo        = this.resultsMappingById.get(item.guid)

            const context           = await this.chooseContextProviderFor(normalized).createContext(normalized)

            const dashboardLaunchInfo   = await this.setDashboardLaunchState(normalized, 'started')
            const dashboardConnector    = this.launcher.dashboardConnector

            let preLaunchRes : boolean

            const stringifiedDesc   = stringify(normalized)

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            try {
                preLaunchRes        = await context.preLaunchTest(normalized, stringifiedDesc, this.getTestLaunchDelay())
            } catch (e) {
                const startDate     = new Date()
                const endDate       = new Date()

                const testNode      = TestNodeResultReactive.new({ descriptor : normalized, startDate, endDate })

                this.reporter.onSubTestStart(testNode)
                dashboardConnector?.onSubTestStart(item.guid, testNode.localId, undefined, normalized, startDate)

                const exception     = testNode.addResult(Exception.new({ exception : e }))
                dashboardConnector?.onResult(item.guid, testNode.localId, exception)

                this.reporter.onSubTestFinish(testNode)
                dashboardConnector?.onSubTestFinish(item.guid, testNode.localId, false, endDate)

                this.setDashboardLaunchState(item, 'completed')

                await slot.setTask(async () => {
                    await context.destroy()
                })

                return
            }

            // no global importer available - test file is probably empty, or does not import any Siesta code
            // test will be reported as passed
            if (!preLaunchRes) {
                const startDate     = new Date()
                const endDate       = new Date()

                const testNode      = TestNodeResultReactive.new({ descriptor : normalized, startDate, endDate })

                this.reporter.onSubTestStart(testNode)
                dashboardConnector?.onSubTestStart(item.guid, testNode.localId, undefined, normalized, startDate)

                this.reporter.onSubTestFinish(testNode)
                dashboardConnector?.onSubTestFinish(item.guid, testNode.localId, false, endDate)

                this.setDashboardLaunchState(item, 'completed')

                await slot.setTask(async () => {
                    await context.destroy()
                })

                return
            }

            const { server, client } = this.getLauncherConnectorInfo(normalized)

            const testLauncher      = server.launcherConnectorClass.new({
                launcher            : this.launcher,
                logger              : this.logger,
                reporter            : this.reporter,
                launchInfo,
                context
            })

            try {
                await context.setupChannel(testLauncher, client.importerUrl, client.symbol)

                this.logger.debug("Channel ready for: ", normalized.url)

                await testLauncher.launchTest(stringifiedDesc, checkInfo, dashboardLaunchInfo)
            } finally {
                this.setDashboardLaunchState(item, 'completed')

                await slot.setTask(async () => {
                    await testLauncher.disconnect(true)
                    await context.destroy()
                })
            }
        }


        getLauncherConnectorInfo (desc : TestDescriptor) : LauncherConnectorClassLocator {
            return {
                server  : { launcherConnectorClass : TestLauncherParent },
                client  : {
                    importerUrl     : 'src/siesta/test/port/TestLauncherChild.js',
                    symbol          : 'TestLauncherChild'
                }
            }
        }


        getTestLaunchDelay () : number {
            // no delay by default
            return 0
        }


        async launchStandaloneSameContextTest (topTest : Test) {
            const descriptor                = topTest.descriptor

            this.projectPlanItemsToLaunch   = [ descriptor ]

            this.logger.debug("Launching standalone test: ", descriptor.url)

            const launchInfo                = this.resultsMappingById.get(descriptor.guid)

            this.reporter.onTestSuiteStart()

            this.beforeTestLaunch(descriptor)

            const { server, client }    = this.getLauncherConnectorInfo(descriptor)

            const testLauncher          = server.launcherConnectorClass.new({
                launcher        : this.launcher,
                logger          : this.logger,
                reporter        : this.reporter,
                launchInfo
            })
            const testLauncherChild : TestLauncherChild = (await importer.getImporter(client.importerUrl)())[ client.symbol ].new()

            const parentMedia           = new MediaSameContext()
            const childMedia            = new MediaSameContext()

            parentMedia.targetMedia     = childMedia
            childMedia.targetMedia      = parentMedia

            testLauncher.media          = parentMedia
            testLauncherChild.media     = childMedia

            testLauncherChild.connect()
            await testLauncher.connect()

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            topTest.connector            = testLauncherChild

            await topTest.start()

            this.reporter.onTestSuiteFinish()
        }
    }
) {}
