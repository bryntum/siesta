import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { ProjectPlanItem } from "../project/Plan.js"
import { Project } from "../project/Project.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestLauncherParent } from "../test/channel/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"

//---------------------------------------------------------------------------------------------------------------------
export enum ExitCodes {
    'PASSED'        = 0,  // all tests passed
    'FAILED'        = 1,  // test suite completed, some failures
    'TIMEOUT'       = 2,  // some test does not complete within timeout
// 1 - there were test failures
// 2 - inactivity timeout while running the test suite
// 3 - no supported browsers available on this machine
// 4 - no tests to run (probably `include/filter` doesn't match any test url or `exclude` match everything)
// 5 - can't open project page
// 6 - wrong arguments
// 7 - exception thrown
// 8 - exit after printing version
// 9 - java is not installed or not available in PATH
}

//---------------------------------------------------------------------------------------------------------------------
export class Launcher extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Launcher extends base {
        projectFileUrl      : string            = ''

        inputArguments

        // project         : Project                                   = undefined
        //
        // projectPlanItemsToLaunch        : ProjectPlanItem[]         = []
        //
        // testContextProviders   : TestContextProvider[]                          = []
        //
        // testContextProviderConstructors   : (typeof TestContextProvider)[]      = []
        //
        // reporter            : Reporter      = undefined
        //
        //
        // get logger () : Logger {
        //     return this.project.logger
        // }
        //
        // set logger (value : Logger) {
        // }
        //
        //
        // registerTestContextProvider (localContextProvider : TestContextProvider) {
        //     this.testContextProviders.push(localContextProvider)
        // }


        async start () : Promise<ExitCodes> {
            await this.setup()

            // await this.launch()

            return ExitCodes.PASSED
        }


        async setup () {
            // this.reporter       = this.project.reporterClass.new({ c : this.project.colorerClass.new(), launch : this })
            //
            // await Promise.all(this.testContextProviderConstructors.map(tcpConstructor => {
            //     const tcp                   = tcpConstructor.new({ launch : this })
            //
            //     return tcp.setup().then(() => {
            //         this.registerTestContextProvider(tcp)
            //     }, rejected => {
            //         this.logger.debug(`Failed to setup context provider: ${rejected}`)
            //     })
            // }))
            //
            // if (this.testContextProviders.length === 0) throw new Error("Dispatcher setup failed - no context providers available")
        }


        // async launch () {
        //     this.reporter.onTestSuiteStart()
        //
        //     const projectPlanItems      = this.projectPlanItemsToLaunch
        //
        //     for (const item of projectPlanItems) {
        //         await this.launchProjectPlanItem(item)
        //     }
        //
        //     this.reporter.onTestSuiteFinish()
        // }
        //
        //
        // async launchProjectPlanItem (item : ProjectPlanItem) {
        //     item.normalizeDescriptor()
        //
        //     this.logger.log("Launching project item: ", item.descriptor.url)
        //
        //     const context       = await this.createTestContext(item.descriptor)
        //
        //     context.reporter    = this.reporter
        //
        //     //debugger
        //
        //     await context.launchTest(item.descriptor)
        //
        //     context.disconnect()
        //
        //     //debugger
        // }
        //
        //
        // async createTestContext (desc : TestDescriptor) : Promise<TestLauncherParent> {
        //     return await this.testContextProviders[ 0 ].createTestContext(desc)
        // }

    }
) {}
