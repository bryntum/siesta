import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger, LogLevel } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { Channel } from "../channel/Channel.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { ProjectDescriptor } from "../project/Project.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerNoop } from "../reporter/ColorerNoop.js"
import { Printer } from "../reporter/Printer.js"
import { Reporter } from "../reporter/Reporter.js"
import { Launch } from "./Launch.js"
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
     * Test suite completed successfully, some tests failed
     */
    'EXCEPTION_IN_PROJECT_FILE'   = 2,

    /**
     * Incorrect command-line arguments, test suite did not start
     */
    'INCORRECT_ARGUMENTS'   = 6,
}


@serializable()
export class LauncherError extends Serializable.mix(Base) {
    annotation          : XmlElement    = undefined

    exitCode            : ExitCodes     = undefined
}


//---------------------------------------------------------------------------------------------------------------------
export class Launcher extends Mixin(
    [ Printer, LoggerConsole, Base ],
    (base : ClassUnion<typeof Printer, typeof LoggerConsole, typeof Base>) =>

    class Launcher extends base {
        logger              : Logger            = LoggerConsole.new({ logLevel : LogLevel.warn })

        projectFileUrl      : string            = ''

        inputArguments      : string[]          = []

        reporterClass       : typeof Reporter       = undefined
        colorerClass        : typeof Colorer        = ColorerNoop

        projectDescriptor   : ProjectDescriptor = undefined

        channelConstructors     : (typeof Channel)[]      = []


        async start () : Promise<ExitCodes> {
            try {
                await this.setup()
            } catch (e) {
                if (e instanceof LauncherError) {
                    this.write(e.annotation)

                    return e.exitCode
                } else {
                    throw e
                }
            }

            return await this.launch()
        }


        async prepareOptions () {
            const parseResult       = parseOptions2(this.inputArguments)

            if (parseResult.argv.length === 0) {
                throw LauncherError.new({
                    annotation      : <div>
                        <span class="log_message_error"> ERROR </span> <span class="accented">No argument for project file url</span>
                    </div>,
                    exitCode        : ExitCodes.INCORRECT_ARGUMENTS
                })
            }

            return parseResult
        }


        get targetContextChannelClass () : typeof Channel {
            throw new Error("Abstract method called")
        }


        $projectExtractorChannelClass : typeof ChannelProjectExtractor  = undefined

        get projectExtractorChannelClass () : typeof ChannelProjectExtractor {
            if (this.$projectExtractorChannelClass !== undefined) return this.$projectExtractorChannelClass

            return this.$projectExtractorChannelClass = class ChannelProjectExtractorImplementation extends Mixin(
                [ ChannelProjectExtractor, this.targetContextChannelClass ],
                (base : ClassUnion<typeof ChannelProjectExtractor, typeof Channel>) =>

                class ChannelProjectExtractorImplementation extends base {}
            ) {}
        }


        async setup () {
            // const parseResult       = await this.prepareOptions()
            //
            // const channel : ChannelProjectExtractor    = this.projectExtractorChannelClass.new()
            //
            // await channel.setup()
            //
            // const parentPort        = channel.parentPort
            //
            // const projectUrl        = this.prepareProjectFileUrl(parseResult.argv[ 0 ])
            //
            // this.projectDescriptor  = await parentPort.extractProject(projectUrl)
            //
            // this.projectDescriptor.projectPlan.descriptor.url   = projectUrl.replace(/\/[^/]*?$/, '')
            //
            // await parentPort.disconnect()
        }


        prepareProjectFileUrl (url : string) : string {
            return url
        }


        async launch () : Promise<ExitCodes> {
            const launch    = Launch.new({
                launcher                                : this,
                projectDescriptor                       : this.projectDescriptor,
                projectPlanItemsToLaunch                : this.projectDescriptor.projectPlan.leafsAxis(),

                targetContextChannelClass               : this.targetContextChannelClass
            })

            await launch.start()

            return ExitCodes.PASSED
        }
    }
) {}
