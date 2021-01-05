import { Port } from "../../port/Port.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { ProjectPlanItem } from "../project/Plan.js"
import { Project } from "../project/Project.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestLauncherParent } from "../test/port/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { parseOptions } from "./Option.js"

//---------------------------------------------------------------------------------------------------------------------

// Exit codes:
// 0 - all tests passed
// 1 - there were test failures
// 2 - inactivity timeout while running the test suite
// 3 - no supported browsers available on this machine
// 4 - no tests to run (probably `include/filter` doesn't match any test url or `exclude` match everything)
// 5 - can't open project page
// 6 - wrong arguments
// 7 - exception thrown
// 8 - exit after printing version
// 9 - java is not installed or not available in PATH

export enum ExitCodes {
    /**
     * Test suite completed successfully, all tests passed
     */
    'PASSED'        = 0,

    /**
     * Test suite completed successfully, some tests failed
     */
    'FAILED'        = 1,
}

//---------------------------------------------------------------------------------------------------------------------
export class Launcher extends Mixin(
    [ LoggerConsole, Base ],
    (base : ClassUnion<typeof LoggerConsole, typeof Base>) =>

    class Launcher extends base {
        projectFileUrl      : string            = ''

        inputArguments      : string[]          = []

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

            return await this.launch()
        }


        async prepareOptions () {
            const parseResult       = parseOptions(this.inputArguments, {})

            const provider : any    = null

            await provider.createContext()
        }


        async setup () {
            await this.prepareOptions()
        }


        async launch () : Promise<ExitCodes> {
            return ExitCodes.PASSED
            // this.reporter.onTestSuiteStart()
            //
            // const projectPlanItems      = this.projectPlanItemsToLaunch
            //
            // for (const item of projectPlanItems) {
            //     await this.launchProjectPlanItem(item)
            // }
            //
            // this.reporter.onTestSuiteFinish()
        }


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
