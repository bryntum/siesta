import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { Logger } from "../../logger/Logger.js"
import { ProjectDescriptor } from "../project/ProjectOptions.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { ChannelTestLauncher } from "../test/port/TestLauncher.js"
import { ExitCodes, Launcher } from "./Launcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class Queue extends Base {
    maxWorkers                  : number                = 5

    slots                       : Promise<unknown>[]    = []

    freeSlots                   : number[]              = []

    onFreeSlotAvailableHook     : Hook<[ this ]>        = new Hook()

    onSlotSettledHook           : Hook<[ any, PromiseSettledResult<unknown> ]>        = new Hook()

    onCompletedHook             : Hook                  = new Hook()


    initialize (props? : Partial<Queue>) {
        super.initialize(props)

        for (let i = 0; i < this.maxWorkers; i++) {
            this.slots.push(null)
            this.freeSlots.push(i)
        }
    }


    pullSingle () {
        if (this.freeSlots.length > 0) this.onFreeSlotAvailableHook.trigger(this)

        if (this.freeSlots.length === this.maxWorkers) this.onCompletedHook.trigger()
    }


    pull () {
        while (this.freeSlots.length) {
            this.onFreeSlotAvailableHook.trigger(this)

            if (this.freeSlots.length === this.maxWorkers) {
                this.onCompletedHook.trigger()
                break
            }
        }
    }


    async push (id : any, promise : Promise<unknown>) {
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
            this.onSlotSettledHook.trigger(id, { status : 'rejected', reason })
        else
            this.onSlotSettledHook.trigger(id, { status : 'fulfilled', value })
    }
}



//---------------------------------------------------------------------------------------------------------------------
export class Launch extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Launch extends base {
        launcher                    : Launcher              = undefined
        projectDescriptor           : ProjectDescriptor     = undefined

        projectPlanItemsToLaunch    : TestDescriptor[]      = []

        reporter                    : Reporter              = undefined

        targetContextChannelClass   : typeof Channel        = undefined

        type                        : 'project' | 'test'    = 'project'

        mode                        : 'sequential' | 'parallel' = 'sequential'
        maxWorkers                  : number                    = 5


        $testLauncherChannelClass : typeof ChannelTestLauncher  = undefined

        get testLauncherChannelClass () : typeof ChannelTestLauncher {
            if (this.$testLauncherChannelClass !== undefined) return this.$testLauncherChannelClass

            return this.$testLauncherChannelClass = class ChannelTestLauncherImplementation extends Mixin(
                [ ChannelTestLauncher, this.targetContextChannelClass ],
                (base : ClassUnion<typeof ChannelTestLauncher, typeof Channel>) =>

                class ChannelTestLauncherImplementation extends base {}
            ) {}
        }


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

            const projectPlanItems      = this.projectPlanItemsToLaunch

            const queue                 = Queue.new({ maxWorkers : this.maxWorkers})

            queue.onFreeSlotAvailableHook.on(() => {
                queue.push(null, this.launchProjectPlanItem(projectPlanItems.shift()))
            })

            if (this.mode === 'parallel') {
                queue.onSlotSettledHook.on(() => queue.pull())

                queue.pull()
            }
            else {
                queue.onSlotSettledHook.on(() => queue.pullSingle())

                queue.pullSingle()
            }

            await new Promise<void>(resolve => queue.onCompletedHook.on(resolve))

            this.reporter.onTestSuiteFinish()
        }


        async launchProjectPlanItem (item : TestDescriptor) {
            const normalized        = item.flatten

            this.logger.log("Launching project item: ", normalized.url)

            const channel           = this.testLauncherChannelClass.new()

            await channel.setup()

            const testLauncher      = channel.parentPort

            testLauncher.reporter   = this.reporter

            await testLauncher.launchTest(normalized)

            testLauncher.disconnect()
        }


        getExitCode () : ExitCodes {
            return ExitCodes.PASSED
        }
    }
) {}
