import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../collection/Iterator.js"
import { Logger, LogLevel } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { objectEntriesDeep } from "../../util/Helpers.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { ProjectPlanItem } from "../project/Plan.js"
import { ProjectDescriptor } from "../project/Project.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerNoop } from "../reporter/ColorerNoop.js"
import { Printer } from "../reporter/Printer.js"
import { Reporter, ReporterDetailing } from "../reporter/Reporter.js"
import { Launch } from "./Launch.js"
import { HasOptions, Option, option, OptionGroup, OptionsBag } from "./Option.js"

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

    /**
     * Internal exception, please report as a bug.
     */
    'UNHANLED_EXCEPTION'    = 7
}


@serializable()
export class LauncherError extends Serializable.mix(Base) {
    annotation          : XmlElement    = undefined

    exitCode            : ExitCodes     = undefined
}

export const OptionsGroupFiltering  = OptionGroup.new({
    name        : 'Filtering',
    weight      : 100
})

export const OptionsGroupPrimary  = OptionGroup.new({
    name        : 'Primary',
    weight      : 1000
})

export const OptionsGroupOutput  = OptionGroup.new({
    name        : 'Output',
    weight      : 900
})

//---------------------------------------------------------------------------------------------------------------------
export class Launcher extends Mixin(
    [ HasOptions, Printer, LoggerConsole, Base ],
    (base : ClassUnion<typeof HasOptions, typeof Printer, typeof LoggerConsole, typeof Base>) => {

    class Launcher extends base {
        logger              : Logger                = LoggerConsole.new({ logLevel : LogLevel.warn })

        inputArguments      : string[]              = []

        optionsBag          : OptionsBag            = undefined

        reporterClass       : typeof Reporter       = undefined
        colorerClass        : typeof Colorer        = ColorerNoop

        projectDescriptor   : ProjectDescriptor = undefined

        // channelConstructors     : (typeof Channel)[]      = []

        setupDone       : boolean           = false
        setupPromise    : Promise<any>      = undefined

        @option({
            type        : 'string',
            group       : OptionsGroupFiltering,
            structure   : "array",
            help        : <span>
                This option specifies a RegExp source, to which the test file URL needs to match, to be <span class="accented">included</span> in the suite launch.
                It can be repeated multiple times, meaning the URL to be included can match any of the provided RegExps.
            </span>
        })
        include         : string[]          = []

        @option({
            group       : OptionsGroupFiltering,
            type        : 'string',
            structure   : "array",
            help        : <span>
                This option specifies a RegExp source, to which the test file URL needs to match, to be <span class="accented">excluded</span> in the suite launch.
                It can be repeated multiple times, meaning the URL to be excluded can match any of the provided RegExps.
            </span>
        })
        exclude         : string[]          = []

        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'file', 'subtest', 'assertion' ],
            group       : OptionsGroupOutput,
            help        : <span>

            </span>
        })
        detail          : ReporterDetailing = 'subtest'


        get argv () : string [] {
            return this.optionsBag.argv
        }


        async start () : Promise<Launch> {
            // need to await for setup, because `projectDescriptor` might not be available yet
            await this.performSetup()

            return await this.launch(this.projectDescriptor.projectPlan.leafsAxis())
        }


        prepareOptions () {
            this.optionsBag     = OptionsBag.new({ input : this.inputArguments })

            const extractRes    = this.optionsBag.extractOptions(
                CI(objectEntriesDeep(this.$options)).map(entry => { return entry[ 1 ] as Option }).toArray()
            )

            extractRes.errors.forEach(error => {
                console.log(error)
            })

            extractRes.warnings.forEach(warning => {
                console.log(warning)
            })

            if (extractRes.errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            extractRes.values.forEach((value, option) => this[ option.name ] = value)
        }


        get targetContextChannelClass () : typeof Channel {
            throw new Error("Abstract method called")
        }


        async performSetup ()  {
            if (!this.setupDone) {
                // setup may be already started (by another launch)
                await (this.setupPromise || (this.setupPromise = this.setup()))

                this.setupDone      = true
                this.setupPromise   = undefined
            }
        }


        async setup () {
            this.prepareOptions()
        }


        async launch (projectPlanItemsToLaunch : ProjectPlanItem[]) : Promise<Launch> {
            await this.performSetup()

            const launch    = Launch.new({
                launcher                                : this,
                projectDescriptor                       : this.projectDescriptor,
                projectPlanItemsToLaunch,

                targetContextChannelClass               : this.targetContextChannelClass
            })

            await launch.start()

            return launch
        }
    }

    return Launcher
}) {}
