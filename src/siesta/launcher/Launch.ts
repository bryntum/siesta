import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { Port } from "../../port/Port.js"
import { Channel } from "../../channel/Channel.js"
import { ProjectPlanItem } from "../project/Plan.js"
import { ProjectDescriptor } from "../project/Project.js"
import { Reporter } from "../reporter/Reporter.js"
import { ChannelTestLauncher } from "../test/port/TestLauncher.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class Launch extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Launch extends base {
        launcher                    : Launcher              = undefined
        projectDescriptor           : ProjectDescriptor     = undefined

        projectPlanItemsToLaunch    : ProjectPlanItem[]     = []

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


        async launchProjectPlanItem (item : ProjectPlanItem) {
            item.normalizeDescriptor()

            this.logger.log("Launching project item: ", item.descriptor.url)

            const channel       = await this.testLauncherChannelClass.new()

            await channel.setup()

            const testLauncher      = channel.parentPort

            testLauncher.reporter   = this.reporter

            await testLauncher.launchTest(item.descriptor)

            testLauncher.disconnect()
        }
    }
) {}
