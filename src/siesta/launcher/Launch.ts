import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { ProjectDescriptor } from "../project/ProjectOptions.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { ChannelTestLauncher } from "../test/port/TestLauncher.js"
import { ExitCodes, Launcher } from "./Launcher.js"


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
            this.reporter       = this.launcher.reporterClass.new({ c : this.launcher.colorerClass.new(), launch : this })
        }


        async launch () {
            this.reporter.onTestSuiteStart()

            const projectPlanItems      = this.projectPlanItemsToLaunch

            for (const item of projectPlanItems) {
                await this.launchProjectPlanItem(item)
            }

            this.reporter.onTestSuiteFinish()
        }


        async launchProjectPlanItem (item : TestDescriptor) {
            const normalized = item.flatten()

            this.logger.log("Launching project item: ", normalized.url)

            const channel       = await this.testLauncherChannelClass.new()

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
