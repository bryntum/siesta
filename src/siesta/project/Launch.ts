import { Port } from "../../port/Port.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestLauncherParent } from "../test/port/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { ProjectPlanItem } from "./Plan.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class Launch extends Mixin(
    [ Port, Base ],
    (base : ClassUnion<typeof Port, typeof Base>) =>

    class Launch extends base {
        project         : Project                                   = undefined

        projectPlanItemsToLaunch        : ProjectPlanItem[]         = []

        testContextProviders   : TestContextProvider[]                          = []

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = []

        reporter            : Reporter      = undefined


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
            this.reporter       = this.project.reporterClass.new({ c : this.project.colorerClass.new(), launch : this })

            await Promise.all(this.testContextProviderConstructors.map(tcpConstructor => {
                const tcp                   = tcpConstructor.new({ launch : this })

                return tcp.setup().then(() => {
                    this.registerTestContextProvider(tcp)
                }, rejected => {
                    this.logger.debug(`Failed to setup context provider: ${rejected}`)
                })
            }))

            if (this.testContextProviders.length === 0) throw new Error("Dispatcher setup failed - no context providers available")
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

            const context       = await this.createTestContext(item.descriptor)

            context.reporter    = this.reporter

            //debugger

            await context.launchTest(item.descriptor)

            context.disconnect()

            //debugger
        }


        async createTestContext (desc : TestDescriptor) : Promise<TestLauncherParent> {
            return await this.testContextProviders[ 0 ].createTestContext(desc)
        }

    }
) {}
