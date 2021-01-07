import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { Channel } from "../channel/Channel.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { Colorer } from "../reporter/Colorer.js"
import { Printer } from "../reporter/Printer.js"
import { Reporter } from "../reporter/Reporter.js"
import { parseOptions2 } from "./Option.js"
import { ChannelProjectExtractor } from "./ProjectExtractor.js"

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

    /**
     * Incorrect command-line arguments, test suite did not start
     */
    'INCORRECT_ARGUMENTS'   = 2,
}


export class LauncherError extends Error {
    annotation          : XmlElement    = undefined

    exitCode            : ExitCodes     = undefined

    static new<T extends typeof LauncherError> (this : T, props? : Partial<InstanceType<T>>) : InstanceType<T> {
        const instance      = new this()

        props && Object.assign(instance, props)

        return instance as InstanceType<T>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class Launcher extends Mixin(
    [ Printer, LoggerConsole, Base ],
    (base : ClassUnion<typeof Printer, typeof LoggerConsole, typeof Base>) =>

    class Launcher extends base {
        projectFileUrl      : string            = ''

        inputArguments      : string[]          = []



        // project         : Project                                   = undefined
        //
        // projectPlanItemsToLaunch        : ProjectPlanItem[]         = []

        // testContextProviders   : TestContextProvider[]                          = []

        channelConstructors     : (typeof Channel)[]      = []

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
            try {
                await this.setup()
            } catch (e) {
                if (e instanceof LauncherError) {
                    this.write(e.annotation)

                    return e.exitCode
                } else {

                }
            }

            return await this.launch()
        }


        async prepareOptions () {
            const parseResult       = parseOptions2(this.inputArguments)

            if (parseResult.argv.length === 0) {
                throw LauncherError.new({
                    annotation      : <div><span class="log_message_error">ERROR</span>:No argument for project file url</div>,
                    exitCode        : ExitCodes.INCORRECT_ARGUMENTS
                })
            }
        }


        $targetContextChannelClass : typeof Channel  = undefined

        get targetContextChannelClass () : typeof Channel {
            throw new Error("Abstract method called")
        }


        $projectExtractorChannelClass : typeof ChannelProjectExtractor  = undefined

        get projectExtractorChannelClass () : typeof ChannelProjectExtractor {
            return class ChannelProjectExtractorImplementation extends Mixin(
                [ ChannelProjectExtractor, this.targetContextChannelClass ],
                (base : ClassUnion<typeof ChannelProjectExtractor, typeof Channel>) =>

                class ChannelProjectExtractorImplementation extends base {
                }
            ) {}
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

            await this.prepareOptions()

            const channel : ChannelProjectExtractor    = this.projectExtractorChannelClass.new()

            await channel.setup()

            const parentPort    = channel.parentPort

            const project       = await parentPort.extractProject('')

            console.log(project)
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


        logger          : Logger            = Logger.new()

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = []

        setupDone       : boolean           = false
        setupPromise    : Promise<any>      = undefined

        reporterClass   : typeof Reporter   = undefined
        colorerClass    : typeof Colorer    = undefined


    }
) {}
