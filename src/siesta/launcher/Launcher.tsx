import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { Logger, LogLevel } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { objectEntriesDeep } from "../../util/Helpers.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { ProjectDescriptor } from "../project/ProjectOptions.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { Printer } from "../reporter/Printer.js"
import { Reporter, ReporterDetailing } from "../reporter/Reporter.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Launch } from "./Launch.js"
import {
    HasOptions,
    Option,
    option,
    optionErrorTemplateByCode,
    OptionGroup,
    OptionParseWarning,
    OptionsBag,
    OptionsParseWarningCodes,
    optionWarningTemplateByCode
} from "./Option.js"

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

        projectDescriptor   : ProjectDescriptor     = undefined

        // channelConstructors     : (typeof Channel)[]      = []

        setupDone       : boolean           = false
        setupPromise    : Promise<any>      = undefined

        @option({
            type        : 'string',
            group       : OptionsGroupFiltering,
            structure   : "array",
            help        : <span>
                This option specifies a RegExp source, to which the test file URL needs to match,
                to be <span class="accented">included</span> in the suite launch.
                It can be repeated multiple times, meaning the URL to be included can match any of the provided RegExps.
            </span>
        })
        include         : RegExp[]          = []

        @option({
            group       : OptionsGroupFiltering,
            type        : 'string',
            structure   : "array",
            help        : <span>
                This option specifies a RegExp source, to which the test file URL needs to match,
                to be <span class="accented">excluded</span> in the suite launch.
                It can be repeated multiple times, meaning the URL to be excluded can match any of the provided RegExps.
            </span>
        })
        exclude         : RegExp[]          = []

        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'file', 'subtest', 'assertion' ],
            group       : OptionsGroupOutput,
            help        : <span>

            </span>
        })
        detail          : ReporterDetailing = 'file'


        get argv () : string [] {
            return this.optionsBag.argv
        }


        async start () : Promise<Launch> {
            try {
                // need to await for setup, because `projectDescriptor` might not be available yet
                await this.performSetup()

                return await this.launch(this.getDescriptorsToLaunch())
            } catch (e) {
                if (e instanceof LauncherError) {
                    this.onLauncherError(e)
                } else {
                    this.onUnknownError(e)
                }
            }
        }


        getDescriptorsToLaunch () : TestDescriptor[] {
            return this.projectDescriptor.projectPlan.leavesAxis().filter(descriptor => {
                return (this.include.length === 0 || this.include.some(pattern => pattern.test(descriptor.flatten.url)))
                    && (this.exclude.length === 0 || !this.exclude.some(pattern => pattern.test(descriptor.flatten.url)))
            })
        }


        onLauncherError (e : LauncherError) {
            e.annotation && this.write(e.annotation)
        }


        onUnknownError (e : unknown) {
        }


        onLauncherOptionsAvailable () {

        }


        prepareLauncherOptions () {
            this.optionsBag     = OptionsBag.new({ input : this.inputArguments })

            const extractRes    = this.optionsBag.extractOptions(
                CI(objectEntriesDeep(this.$options)).map(entry => { return entry[ 1 ] as Option }).toArray()
            )

            extractRes.values.forEach((value, option) => option.applyValue(this, value))

            this.onLauncherOptionsAvailable()

            extractRes.errors.forEach(error => {
                this.write(optionErrorTemplateByCode.get(error.error)(error))
            })

            extractRes.warnings.forEach(warning => {
                this.write(optionWarningTemplateByCode.get(warning.warning)(warning))
            })

            if (extractRes.errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            this.include    = this.include.map(pattern => new RegExp(pattern))
            this.exclude    = this.exclude.map(pattern => new RegExp(pattern))
        }


        prepareProjectOptions () {
            const extractRes    = this.optionsBag.extractOptions(
                CI(objectEntriesDeep(this.projectDescriptor.options.$options)).map(entry => { return entry[ 1 ] as Option }).toArray()
            )

            extractRes.errors.forEach(error => {
                this.write(optionErrorTemplateByCode.get(error.error)(error))
            })

            extractRes.warnings.forEach(warning => {
                this.write(optionWarningTemplateByCode.get(warning.warning)(warning))
            })

            if (extractRes.errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            extractRes.values.forEach((value, option) => option.applyValue(this.projectDescriptor.options, value))
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
            this.prepareLauncherOptions()

            await this.setupInner()

            this.prepareProjectOptions()

            if (this.optionsBag.entries.length) {
                const warnings = CI(this.optionsBag.entries).map(entry => entry.key).uniqueOnly().map(optionName => {
                    const warning : OptionParseWarning = {
                        warning     : OptionsParseWarningCodes.UnknownOption,
                        option      : Option.new({ name : optionName })
                    }

                    return warning
                }).toArray().forEach(warning => this.write(optionWarningTemplateByCode.get(warning.warning)(warning)))

                this.print('\n')
            }
        }


        async setupInner () {
        }


        async launch (projectPlanItemsToLaunch : TestDescriptor[]) : Promise<Launch> {
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
