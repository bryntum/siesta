import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { Logger, LogLevel } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { objectEntriesDeep } from "../../util/Helpers.js"
import { ProjectDescriptor, ProjectOptions } from "../project/ProjectOptions.js"
import { Printer } from "../reporter/Printer.js"
import { Reporter, ReporterDetailing } from "../reporter/Reporter.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Launch } from "./Launch.js"
import {
    ExtractOptionsResult,
    HasOptions,
    Option,
    option,
    optionErrorTemplateByCode,
    OptionGroup,
    OptionsBag,
    OptionsParseWarningCodes,
    optionWarningTemplateByCode
} from "./Option.js"

//---------------------------------------------------------------------------------------------------------------------

// Exit codes:
// 2 - inactivity timeout while running the test suite
// 3 - no supported browsers available on this machine
// 4 - no tests to run (probably `include/filter` doesn't match any test url or `exclude` match everything)
// 5 - can't open project page
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
    'UNHANLED_EXCEPTION'    = 7,

    /**
     * Dry run exit, for example after printing the helps screen or package version.
     */
    'DRY_RUN'               = 8
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
const optionsToArray    = (obj : { [ key : string ] : Option }) : Option[] =>
    objectEntriesDeep(obj).map(entry => entry[ 1 ])


//---------------------------------------------------------------------------------------------------------------------
export type PrepareOptionsResult = {
    extractResult       : ExtractOptionsResult,
    errors              : XmlElement[]
}


//---------------------------------------------------------------------------------------------------------------------
export class Launcher extends Mixin(
    [ HasOptions, Printer, LoggerConsole, Base ],
    (base : ClassUnion<typeof HasOptions, typeof Printer, typeof LoggerConsole, typeof Base>) => {

    class Launcher extends base {
        logger              : Logger                = LoggerConsole.new({ logLevel : LogLevel.warn })

        inputArguments      : string[]              = []

        optionsBag          : OptionsBag            = undefined

        projectOptionsClass : typeof ProjectOptions = ProjectOptions
        testDescriptorClass : typeof TestDescriptor = TestDescriptor

        reporterClass       : typeof Reporter       = undefined

        projectDescriptor   : ProjectDescriptor     = undefined

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

        @option({
            type        : 'number',
            group       : OptionsGroupOutput,
            help        : <span>
                How many lines of source file to show for failed assertion
            </span>
        })
        sourceContext   : number    = 5


        @option({
            type        : 'boolean',
            group       : OptionsGroupPrimary,
            help        : <span>
                Prints the help screen with the list of available options.
            </span>
        })
        help            : boolean           = false

        @option({
            type        : 'boolean',
            group       : OptionsGroupPrimary,
            help        : <span>
                Prints the Siesta version
            </span>
        })
        version         : boolean           = false


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


        // earliest point at which launcher options has been applied already
        onLauncherOptionsAvailable () {
            if (this.help) {
                this.write(this.helpScreenTemplate(
                    [
                        ...optionsToArray(this.$options),
                        ...optionsToArray(this.projectDescriptor ? this.projectDescriptor.options.$options : this.projectOptionsClass.prototype.$options),
                        ...optionsToArray(this.projectDescriptor ? this.projectDescriptor.projectPlan.$options : this.testDescriptorClass.prototype.$options)
                    ]
                ))
            }

            if (this.version) {
                this.write(this.versionTemplate())
            }

            if (this.help || this.version) throw LauncherError.new({ exitCode : ExitCodes.DRY_RUN })
        }


        prepareLauncherOptions () : PrepareOptionsResult {
            this.optionsBag     = OptionsBag.new({ input : this.inputArguments })

            const extractRes    = this.optionsBag.extractOptions(optionsToArray(this.$options))

            extractRes.values.forEach((value, option) => option.applyValue(this, value))

            this.onLauncherOptionsAvailable()

            // extractRes.errors.forEach(error => {
            //     this.write(optionErrorTemplateByCode.get(error.error)(error))
            // })
            //
            // extractRes.warnings.forEach(warning => {
            //     this.write(optionWarningTemplateByCode.get(warning.warning)(warning))
            // })
            //
            // if (extractRes.errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            this.include    = this.include.map(pattern => new RegExp(pattern))
            this.exclude    = this.exclude.map(pattern => new RegExp(pattern))

            return { extractResult : extractRes, errors : [] }
        }


        prepareProjectOptions () : PrepareOptionsResult {
            const extractRes    = this.optionsBag.extractOptions(optionsToArray(this.projectDescriptor.options.$options))

            // extractRes.errors.forEach(error => {
            //     this.write(optionErrorTemplateByCode.get(error.error)(error))
            // })
            //
            // extractRes.warnings.forEach(warning => {
            //     this.write(optionWarningTemplateByCode.get(warning.warning)(warning))
            // })
            //
            // if (extractRes.errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            extractRes.values.forEach((value, option) => option.applyValue(this.projectDescriptor.options, value))

            return { extractResult : extractRes, errors : [] }
        }


        prepareTestDescriptorOptions () : PrepareOptionsResult {
            const extractRes    = this.optionsBag.extractOptions(optionsToArray(this.projectDescriptor.projectPlan.$options))

            // extractRes.errors.forEach(error => {
            //     this.write(optionErrorTemplateByCode.get(error.error)(error))
            // })
            //
            // extractRes.warnings.forEach(warning => {
            //     this.write(optionWarningTemplateByCode.get(warning.warning)(warning))
            // })
            //
            // if (extractRes.errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            extractRes.values.forEach((value, option) => option.applyValue(this.projectDescriptor.projectPlan, value))

            return { extractResult : extractRes, errors : [] }
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
            const prepareLauncherOptions    = this.prepareLauncherOptions()

            await this.setupInner()

            const prepareProjectOptions     = this.prepareProjectOptions()

            const prepareTestDescriptorOptions    = this.prepareTestDescriptorOptions()

            //-----------------------
            const errors : XmlElement[]     = [
                ...prepareLauncherOptions.extractResult.errors,
                ...prepareProjectOptions.extractResult.errors,
                ...prepareTestDescriptorOptions.extractResult.errors
            ].map(error => optionErrorTemplateByCode.get(error.error)(error)).concat(
                prepareLauncherOptions.errors,
                prepareProjectOptions.errors,
                prepareTestDescriptorOptions.errors
            )

            errors.forEach(error => this.write(error))

            //-----------------------
            const warnings                  = [
                ...prepareLauncherOptions.extractResult.warnings,
                ...prepareProjectOptions.extractResult.warnings,
                ...prepareTestDescriptorOptions.extractResult.warnings,
                ...CI(this.optionsBag.entries).map(entry => entry.key).uniqueOnly().map(optionName => {
                    return {
                        warning     : OptionsParseWarningCodes.UnknownOption,
                        option      : Option.new({ name : optionName })
                    }
                })
            ]

            warnings.forEach(warning => this.write(optionWarningTemplateByCode.get(warning.warning)(warning)))


            // if (this.optionsBag.entries.length) {
            //     const warnings = CI(this.optionsBag.entries).map(entry => entry.key).uniqueOnly().map(optionName => {
            //         const warning : OptionParseWarning = {
            //             warning     : OptionsParseWarningCodes.UnknownOption,
            //             option      : Option.new({ name : optionName })
            //         }
            //
            //         return warning
            //     }).toArray().forEach(warning => this.write(optionWarningTemplateByCode.get(warning.warning)(warning)))
            //
            //     this.print('\n')
            // }


            if (errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })
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


        versionTemplate () : XmlElement {
            return <div>Siesta 6.0.0</div>
        }


        helpScreenTemplate (options : Option[]) : XmlElement {
            const optionsByGroup : Map<OptionGroup, Option[]>   = options.reduce((acc, option) => {
                const group     = option.group

                if (!acc.has(group)) acc.set(group, [])

                acc.get(group).push(option)

                return acc
            }, new Map())

            const groups            = Array.from(optionsByGroup.keys())

            groups.sort((group1, group2) => group2.weight - group1.weight)

            return <div class="help_screen">
                <p><span class="accented">npx siesta URL [--option=value]</span></p>
                <p>URL should point to your project file. All options are optional.</p>

                {
                    groups.map(group => <div class="group">
                        <span class="option_group_name">{ '\n' + group.name + ':\n' + '='.repeat(group.name.length + 1) }</span>

                        {
                            optionsByGroup.get(group).map(option => <div class="option">
                                <div class="option_name">{ '--' + option.name }</div>
                                <div class="indented">{ option.help }</div>
                                <p></p>
                            </div>)
                        }
                    </div>)
                }
            </div>
        }
    }

    return Launcher
}) {}
