import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { ChannelTestReporter } from "../test/channel/Reporter.js"
import { ProjectPlanItem } from "./Plan.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) =>

    class Dispatcher extends base {
        project         : Project                   = undefined

        reporter        : ChannelTestReporter                  = undefined

        testContextProviders   : TestContextProvider[]                   = []

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = []


        get logger () : Logger {
            return this.project.logger
        }

        set logger (value : Logger) {
        }


        registerTestContextProvider (localContextProvider : TestContextProvider) {
            this.testContextProviders.push(localContextProvider)
        }


        async start () {
            await this.setup()

            await this.launch()
        }


        async setup () {
            await Promise.all(this.testContextProviderConstructors.map(tcpConstructor => {
                const tcp                   = tcpConstructor.new({ dispatcher : this })

                return tcp.setup().then(() => {
                    this.registerTestContextProvider(tcp)
                }, rejected => {
                    this.logger.debug(`Failed to setup context provider: ${rejected}`)
                })
            }))

            if (this.testContextProviders.length === 0) throw new Error("Dispatcher setup failed - no context providers available")
        }


        async launch () {
            const projectPlanItems      = this.project.projectPlan.leafsAxis()

            for (const item of projectPlanItems) {
                await this.launchProjectPlanItem(item)
            }
        }


        async launchProjectPlanItem (item : ProjectPlanItem) {
            console.log("launch project item: ", item.url)

            const context       = await this.createTestContext()

            debugger

            await context.launchTest(item.url)

            context.destroy()

            debugger
        }


        async createTestContext () {
            return await this.testContextProviders[ 0 ].createTestContext()
        }

    }
) {}
