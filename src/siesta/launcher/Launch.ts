import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { Logger } from "../../logger/Logger.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestLauncherParent } from "../test/port/TestLauncher.js"
import { Test } from "../test/Test.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { ExitCodes, Launcher } from "./Launcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class Queue extends Base {
    maxWorkers                  : number                = 5

    slots                       : Promise<unknown>[]    = []

    freeSlots                   : number[]              = []

    onFreeSlotAvailableHook     : Hook<[ this ]>        = new Hook()

    onSlotSettledHook           : Hook<[ this, unknown, PromiseSettledResult<unknown> ]>        = new Hook()

    onCompletedHook             : Hook<[ this ]>        = new Hook()


    initialize (props? : Partial<Queue>) {
        super.initialize(props)

        for (let i = 0; i < this.maxWorkers; i++) {
            this.slots.push(null)
            this.freeSlots.push(i)
        }
    }


    pullSingle () {
        if (this.freeSlots.length > 0) this.onFreeSlotAvailableHook.trigger(this)

        if (this.freeSlots.length === this.maxWorkers) this.onCompletedHook.trigger(this)
    }


    pull () {
        while (this.freeSlots.length) {
            const before        = this.freeSlots.length

            this.onFreeSlotAvailableHook.trigger(this)

            if (this.freeSlots.length === this.maxWorkers) {
                this.onCompletedHook.trigger(this)
                break
            }

            if (before === this.freeSlots.length) break
        }
    }


    async push (task : unknown, promise : Promise<unknown>) {
        if (this.freeSlots.length === 0) throw new Error("All slots are busy")

        const freeSlot          = this.freeSlots.pop()

        let value, reason

        let thrown : boolean    = false

        try {
            value   = await promise
        } catch (e) {
            reason  = e
            thrown  = true
        }

        this.freeSlots.push(freeSlot)

        if (thrown)
            this.onSlotSettledHook.trigger(this, task, { status : 'rejected', reason })
        else
            this.onSlotSettledHook.trigger(this, task, { status : 'fulfilled', value })
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class Launch extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Launch extends base {
        launcher                    : Launcher                  = undefined
        projectData                 : ProjectSerializableData   = undefined

        projectPlanItemsToLaunch    : TestDescriptor[]          = []

        reporter                    : Reporter                  = undefined

        contextProviders            : ContextProvider[]         = []

        type                        : 'project' | 'test'        = 'project'

        mode                        : 'sequential' | 'parallel' = 'parallel'

        maxWorkers                  : number                    = 5


        get logger () : Logger {
            return this.launcher.logger
        }

        set logger (value : Logger) {
        }


        async start () {
            await this.setup()

            await this.launch()
        }


        async setup () {
            this.reporter       = this.launcher.reporterClass.new({ colorerClass : this.launcher.colorerClass, launch : this })
        }


        async launch () {
            this.reporter.onTestSuiteStart()

            const projectPlanItems      = this.projectPlanItemsToLaunch.slice()

            const queue                 = Queue.new({ maxWorkers : this.maxWorkers })

            queue.onFreeSlotAvailableHook.on(() => {
                if (projectPlanItems.length) {
                    const descriptor        = projectPlanItems.shift()

                    queue.push(descriptor, this.launchProjectPlanItem(descriptor))
                }
            })

            const completed             = new Promise<any>(resolve => queue.onCompletedHook.on(resolve))

            if (this.mode === 'parallel') {
                queue.onSlotSettledHook.on((queue, descriptor : TestDescriptor, result) => {
                    if (result.status === 'rejected') {
                        this.reportLaunchFailure(descriptor, result.reason)
                    }

                    queue.pull()
                })

                queue.pull()
            }
            else {
                queue.onSlotSettledHook.on((queue, descriptor : TestDescriptor, result) => {
                    if (result.status === 'rejected') {
                        this.reportLaunchFailure(descriptor, result.reason)
                    }

                    queue.pullSingle()
                })

                queue.pullSingle()
            }

            await completed

            this.reporter.onTestSuiteFinish()
        }


        reportLaunchFailure (descriptor : TestDescriptor, exception : any) {
            this.logger.error(`Exception when running ${ descriptor.flatten.url }\n`, exception?.stack || exception)
        }


        async launchProjectPlanItem (item : TestDescriptor) {
            const normalized        = item.flatten

            this.logger.debug("Launching project item: ", normalized.url)

            const context           = await this.contextProviders[ 0 ].createContext()

            const testLauncher      = TestLauncherParent.new({ logger : this.logger, reporter : this.reporter })

            //---------------------
            try {
                await context.setupChannel(testLauncher, 'src/siesta/test/port/TestLauncher.js', 'TestLauncherChild')
                await testLauncher.launchTest(normalized)
            } finally {
                await testLauncher.disconnect()
                await context.destroy()
            }
        }


        async launchStandaloneSameContextTest (topTest : Test) {
            this.logger.debug("Launching standalone test: ", topTest.descriptor.url)

            const context           = await this.contextProviders[ 0 ].createContext()

            const testLauncher      = TestLauncherParent.new({ logger : this.logger, reporter : this.reporter })

            await context.setupChannel(testLauncher, 'src/siesta/test/port/TestLauncher.js', 'TestLauncherChild')

            //---------------------
            topTest.reporter        = await testLauncher.getSameContextChildLauncher()

            this.reporter.onTestSuiteStart()

            await topTest.start()

            this.reporter.onTestSuiteFinish()
        }


        getExitCode () : ExitCodes {
            // TODO
            return ExitCodes.PASSED
        }
    }
) {}
