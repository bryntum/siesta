import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LocalContextProvider } from "../context_provider/LocalContextProvider.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) =>

    class Dispatcher extends base {
        project         : Project                   = undefined

        reporter        : any                       = undefined

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
            const lcpSetup      = []

            this.localContextProviderConstructors.forEach(lcpConstructor => {
                const lcp                   = lcpConstructor.new()

                lcpSetup.push(lcp.setup().then(() => {
                    this.registerLocalContextProvider(lcp)
                }, rejected => {
                    this.logger.debug(`Failed to setup context provider: ${rejected}`)
                }))
            })

            await Promise.all(lcpSetup)

            if (this.localContextProviders.length === 0) throw new Error("Dispatcher setup failed - no context providers available")
        }


        async launch () {
        }
    }
) {}
