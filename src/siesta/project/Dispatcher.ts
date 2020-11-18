import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LocalContextProvider } from "../context_provider/LocalContextProvider.js"
import { Reporter } from "../test/reporter/Reporter.js"
import { ProjectPlanItem } from "./Plan.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) =>

    class Dispatcher extends base {
        project         : Project                   = undefined

        reporter        : Reporter                  = undefined

        localContextProviders   : LocalContextProvider[]                   = []

        localContextProviderConstructors   : (typeof LocalContextProvider)[]      = []


        get logger () : Logger {
            return this.project.logger
        }

        set logger (value : Logger) {
        }


        registerLocalContextProvider (localContextProvider : LocalContextProvider) {
            this.localContextProviders.push(localContextProvider)
        }


        async start () {
            await this.setup()

            await this.launch()
        }


        async setup () {
            await Promise.all(this.localContextProviderConstructors.map(lcpConstructor => {
                const lcp                   = lcpConstructor.new({ dispatcher : this })

                return lcp.setup().then(() => {
                    this.registerLocalContextProvider(lcp)
                }, rejected => {
                    this.logger.debug(`Failed to setup context provider: ${rejected}`)
                })
            }))

            if (this.localContextProviders.length === 0) throw new Error("Dispatcher setup failed - no context providers available")
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
        }


        async createTestContext () {
            return await this.localContextProviders[ 0 ].createTestContext()
        }

    }
) {}
