import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { Logger } from "../../logger/Logger.js"
import { MediaSameContext } from "../../rpc/media/MediaSameContext.js"
import { stringify } from "../../serializable/Serializable.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestLauncherChild, TestLauncherParent } from "../test/port/TestLauncher.js"
import { Test } from "../test/Test.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { Exception, TestNodeResultReactive } from "../test/TestResult.js"
import { ExitCodes, Launcher } from "./Launcher.js"
import { Queue } from "./Queue.js"
import { TestLaunchInfo } from "./TestLaunchInfo.js"


//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Dispatcher extends base {
        launcher                    : Launcher                  = undefined

        runningQueue                : Queue                     = undefined

        pendingQueue                : {
            order       : TestDescriptor[],
            presence    : Set<TestDescriptor>
        }                                                       = { order : [], presence : new Set() }

        results         : Map<TestDescriptor, TestLaunchInfo>   = new Map()

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

                desc && queue.push(desc, this.launchProjectPlanItem(desc))
            })

            this.runningQueue.onSlotSettledHook.on((queue, descriptor : TestDescriptor, result) => {
                if (result.status === 'rejected') this.reportLaunchFailure(descriptor, result.reason)

                queue.pull()
            })

            this.launcher.projectData.projectPlan.leavesAxis().forEach(
                descriptor => this.results.set(descriptor, TestLaunchInfo.new({ descriptor }))
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


        isCompleted () : boolean {
            return this.pendingQueue.order.length === 0 && this.runningQueue.isEmpty
        }


        addRunOnceBatch (descriptors : TestDescriptor[]) {
            this.projectPlanItemsToLaunch   = descriptors

            descriptors.forEach(desc => this.addPendingTest(desc))
        }


        addPendingTest (desc : TestDescriptor) {
            const pendingQueue  = this.pendingQueue

            if (pendingQueue.presence.has(desc)) return

            pendingQueue.order.push(desc)
            pendingQueue.presence.add(desc)

            this.runningQueue.pull()
        }


        shiftPendingTest () : TestDescriptor | undefined {
            const pendingQueue  = this.pendingQueue
            const desc          = pendingQueue.order.shift()

            desc && pendingQueue.presence.delete(desc)

            return desc
        }


        // async start () {
        //     await this.setup()
        //
        //     await this.launch()
        // }
        //
        //
        // async setup () {
        // }


        // async launch () {
        //     this.reporter.onTestSuiteStart()
        //
        //     const projectPlanItems      = this.projectPlanItemsToLaunch.slice()
        //
        //     if (projectPlanItems.length > 0) {
        //         const queue                 = Queue.new({ maxWorkers : this.maxWorkers })
        //         const completed             = new Promise<any>(resolve => queue.onCompletedHook.on(resolve))
        //
        //         queue.onFreeSlotAvailableHook.on(() => {
        //             if (projectPlanItems.length) {
        //                 const descriptor        = projectPlanItems.shift()
        //
        //                 queue.push(descriptor, this.launchProjectPlanItem(descriptor))
        //             }
        //         })
        //
        //         queue.onSlotSettledHook.on((queue, descriptor : TestDescriptor, result) => {
        //             if (result.status === 'rejected') this.reportLaunchFailure(descriptor, result.reason)
        //
        //             queue.pull()
        //         })
        //
        //         queue.pull()
        //
        //         await completed
        //     } else {
        //         this.logger.error('No tests to run')
        //     }
        //
        //     this.reporter.onTestSuiteFinish()
        //
        //     this.computeExitCode()
        // }


        reportLaunchFailure (descriptor : TestDescriptor, exception : any) {
            this.logger.error(`Exception when running ${ descriptor.flatten.url }\n`, exception?.stack || exception)
        }


        beforeTestLaunch (desc : TestDescriptor) {
            this.reporter.onBeforeTestLaunch(desc)
        }


        async launchProjectPlanItem (item : TestDescriptor) {
            const normalized        = item.flatten

            this.logger.debug("Launching project item: ", normalized.url)

            this.beforeTestLaunch(normalized)

            const context           = await this.contextProviders[ 0 ].createContext()

            let preLaunchRes : boolean

            const stringifiedDesc   = stringify(normalized)

            //---------------------
            try {
                preLaunchRes        = await context.preLaunchTest(normalized.urlAbs, stringifiedDesc, this.getTestLaunchDelay())
            } catch (e) {
                const testNode      = TestNodeResultReactive.new({ descriptor : normalized })

                this.reporter.onSubTestStart(testNode)
                testNode.addResult(Exception.new({ exception : e }))
                this.reporter.onSubTestFinish(testNode)

                await context.destroy()

                return
            }

            // no global importer available - test file is probably empty, or does not import any Siesta code
            // test will be reported as passed
            if (!preLaunchRes) {
                const testNode      = TestNodeResultReactive.new({ descriptor : normalized })

                this.reporter.onSubTestStart(testNode)
                this.reporter.onSubTestFinish(testNode)

                await context.destroy()

                return
            }

            const testLauncher      = TestLauncherParent.new({ logger : this.logger, reporter : this.reporter })

            try {
                await context.setupChannel(testLauncher, 'src/siesta/test/port/TestLauncher.js', 'TestLauncherChild')

                this.logger.debug("Channel ready for: ", normalized.url)

                await testLauncher.launchTest(stringifiedDesc)
            } finally {
                await testLauncher.disconnect()
                await context.destroy()
            }
        }


        getTestLaunchDelay () : number {
            // no delay by default
            return 0
        }


        async launchStandaloneSameContextTest (topTest : Test) {
            this.projectPlanItemsToLaunch = [ topTest.descriptor ]

            this.logger.debug("Launching standalone test: ", topTest.descriptor.url)

            this.reporter.onTestSuiteStart()

            this.beforeTestLaunch(topTest.descriptor)

            const testLauncher          = TestLauncherParent.new({ logger : this.logger, reporter : this.reporter })
            const testLauncherChild     = TestLauncherChild.new()

            const parentMedia           = new MediaSameContext()
            const childMedia            = new MediaSameContext()

            parentMedia.targetMedia     = childMedia
            childMedia.targetMedia      = parentMedia

            testLauncher.media          = parentMedia
            testLauncherChild.media     = childMedia

            testLauncherChild.connect()
            await testLauncher.connect()

            //---------------------
            topTest.reporter            = testLauncherChild

            await topTest.start()

            this.reporter.onTestSuiteFinish()
        }
    }
) {}
