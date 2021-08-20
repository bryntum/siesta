import minimatch, { IMinimatch } from "../../../web_modules/minimatch.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { Logger, LogLevel } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { local } from "../../rpc/port/Port.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { objectEntriesDeep } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderSameContext } from "../context/context_provider/ContextProviderSameContext.js"
import { ContextProviderTargetBrowser } from "../context/context_provider/ContextProviderTargetBrowser.js"
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
} from "../option/Option.js"
import { ProjectDescriptor, ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ConsoleXmlRenderer } from "../reporter/ConsoleXmlRenderer.js"
import { Reporter, ReporterDetailing } from "../reporter/Reporter.js"
import { HasRuntimeAccess } from "../runtime/Runtime.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { SubTestCheckInfo } from "../test/TestResult.js"
import { Dispatcher } from "./Dispatcher.js"
import { LauncherRemoteInterface } from "./LauncherRemoteInterface.js"

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
    'UNHANDLED_EXCEPTION'   = 7,

    /**
     * Dry run exit, for example when no tests are matching the filtering criteria, or after printing the helps screen or package version.
     */
    'DRY_RUN'               = 8
}


//---------------------------------------------------------------------------------------------------------------------
@serializable({ id : 'LauncherError' })
export class LauncherError extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class LauncherError extends base {
        message             : string        = undefined

        annotation          : XmlElement    = undefined

        exitCode            : ExitCodes     = undefined
    }
) {}

//---------------------------------------------------------------------------------------------------------------------
export const OptionsGroupFiltering  = OptionGroup.new({
    name        : 'filter',
    title       : 'Filtering',
    weight      : 100
})

export const OptionsGroupPrimary  = OptionGroup.new({
    name        : 'launcher',
    title       : 'Primary launcher options',
    weight      : 1000
})

export const OptionsGroupOutput  = OptionGroup.new({
    name        : 'output',
    title       : 'Output',
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
    [ PortHandshakeParent, HasOptions, ConsoleXmlRenderer, HasRuntimeAccess, Base ],
    (base : ClassUnion<typeof PortHandshakeParent, typeof HasOptions, typeof ConsoleXmlRenderer, typeof HasRuntimeAccess, typeof Base>) =>

    class Launcher extends base implements LauncherRemoteInterface {
        projectData             : ProjectSerializableData   = undefined

        $logger                 : Logger                    = LoggerConsole.new({ logLevel : LogLevel.warn })

        //------------------
        inputArguments          : string[]                  = []

        optionsBag              : OptionsBag                = undefined

        //------------------
        dispatcherClass         : typeof Dispatcher         = Dispatcher

        projectDescriptorClass  : typeof ProjectDescriptor  = ProjectDescriptor

        testDescriptorClass     : typeof TestDescriptor     = TestDescriptor

        reporterClass           : typeof Reporter           = undefined

        //------------------
        dispatcher              : Dispatcher                = undefined

        reporter                : Reporter                  = undefined

        //------------------
        setupDone               : boolean                   = false
        setupPromise            : Promise<any>              = undefined

        //------------------
        contextProviderConstructors : (typeof ContextProvider)[]    = []

        contextProviders            : ContextProvider[]             = []

        contextProviderSameContext  : ContextProviderSameContext    = undefined

        keepNLastResults        : number                    = 0


        get logger () : Logger {
            return this.$logger
        }

        set logger (value : Logger) {
            this.$logger    = value
        }


        // region options
        @option({
            type        : 'string',
            group       : OptionsGroupPrimary,
            help        : <span>
                Project file url. Can be either a regular filesystem path, or http-based URL, or a `file://` url
            </span>
        })
        project             : string            = ''

        @option({
            type        : 'number',
            group       : OptionsGroupFiltering,
            defaultValue : () => 5,
            help        : <span>
                This option defines the number of parallel "workers" for test processing.
            </span>
        })
        maxWorkers      : number            = 5

        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'info', 'debug', 'log', 'warn', 'error' ],
            group       : OptionsGroupFiltering,
            help        : <span>
                This option defines the detail level of the output. By default only warnings and errors are printed.
            </span>
        })
        logLevel        : LogLevel          = LogLevel.warn

        @option({
            type        : 'string',
            group       : OptionsGroupFiltering,
            structure   : "array",
            help        : <span>
                This option specifies a glob pattern source, to which the test file URL needs to match,
                to be <span class="accented">included</span> in the suite launch.
                It can be repeated multiple times, meaning the URL to be included can match any of the provided globs.
                <div></div>
                <span class="inverse"> IMPORTANT </span> Don't forget to wrap you pattern in single quotes: 'dir*/*', otherwise, shell
                will expand it in-place
                <div></div>
                For convenience, the pattern is automatically prepended with `**/`, so it matches deeply across the directories.
            </span>
        })
        include         : string[]          = []

        includeMatches  : IMinimatch[]      = []

        @option({
            group       : OptionsGroupFiltering,
            type        : 'string',
            structure   : "array",
            help        : <div>
                This option specifies a glob pattern source, to which the test file URL needs to match,
                to be <span class="accented">excluded</span> in the suite launch.
                It can be repeated multiple times, meaning the URL to be excluded can match any of the provided globs.
                <div></div>
                <span class="inverse"> IMPORTANT </span> Don't forget to wrap you pattern in single quotes: 'dir*/*', otherwise, shell
                will expand it in-place
                <div></div>
                For convenience, the pattern is automatically prepended with `**/`, so it matches deeply across the directories.
            </div>
        })
        exclude         : string[]          = []

        excludeMatches  : IMinimatch[]      = []

        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'file', 'subtest', 'assertion' ],
            group       : OptionsGroupOutput,
            defaultValue : () => 'file',
            help        : <span>
                The detail level of the text output. Only applied to the passed assertions, the failed assertion are always
                included in the output.
            </span>
        })
        detail          : ReporterDetailing = 'file'

        @option({
            type        : 'number',
            group       : OptionsGroupOutput,
            defaultValue : () => 5,
            help        : <span>
                How many lines of source file to show for failed assertion.
            </span>
        })
        sourceContext   : number    = 5

        @option({
            type        : 'boolean',
            group       : OptionsGroupPrimary,
            help        : <span>
                Opens the Siesta Dashboard UI instead of running the project immediately.
            </span>
        })
        ui                      : boolean   = false

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

        // endregion


        get contextProviderBrowser () : ContextProviderTargetBrowser[] {
            return this.contextProviders.filter(provider => provider instanceof ContextProviderTargetBrowser) as ContextProviderTargetBrowser[]
        }

        get contextProviderNode () : ContextProvider[] {
            return this.contextProviders.filter(provider => provider.supportsNodejs)
        }

        get contextProviderDeno () : ContextProvider[] {
            return this.contextProviders.filter(provider => provider.supportsDeno)
        }


        getSuitableContextProviders (environment : EnvironmentType) : ContextProvider[] {
            if (environment === 'browser')
                return this.contextProviderBrowser
            else if (environment === 'nodejs')
                return this.contextProviderNode
            else if (environment === 'deno')
                return this.contextProviderDeno
            else
                // for isomorphic code any provider is ok
                return this.contextProviders
        }


        setExitCode (code : ExitCodes) {
        }


        get argv () : string [] {
            return this.optionsBag.argv
        }


        async start () : Promise<void> {
            try {
                // need to await for setup, because `projectDescriptor` might not be available yet
                await this.performSetupOnce()

                await this.doStart()
            } catch (e) {
                if (e instanceof LauncherError) {
                    this.onLauncherError(e)
                } else {
                    this.onUnknownError(e)
                }
            }
        }


        async doStart () {
            if (this.ui) {
                await this.launchDashboardUI()
            } else {
                await this.launchOnce(this.getDescriptorsToLaunch())

                this.setExitCode(this.computeExitCode())
            }
        }


        async launchDashboardUI () {
        }


        computeExitCode () : ExitCodes {
            const projectPlanItemsToLaunch  = this.dispatcher.projectPlanItemsToLaunch

            const allFinalizedProperly  = this.reporter.resultsCompleted.size === projectPlanItemsToLaunch.length
            const allPassed             = CI(this.reporter.resultsCompleted).every(testNode => testNode.passed)

            if (projectPlanItemsToLaunch.length === 0) {
                return ExitCodes.DRY_RUN
            }
            else if (allFinalizedProperly && allPassed) {
                return ExitCodes.PASSED
            }
            else if (allFinalizedProperly) {
                return ExitCodes.FAILED
            }
            else {
                return ExitCodes.UNHANDLED_EXCEPTION
            }
        }


        getDescriptorsToLaunch () : TestDescriptor[] {
            return this.projectData.projectPlan.leavesAxis().filter(descriptor => {
                return (this.includeMatches.length === 0 || this.includeMatches.some(pattern => pattern.match(descriptor.flatten.urlAbs)))
                    && (this.excludeMatches.length === 0 || !this.excludeMatches.some(pattern => pattern.match(descriptor.flatten.urlAbs)))
            })
        }


        onLauncherError (e : LauncherError) {
            e.annotation && this.write(e.annotation)
            e.message && this.logger.error(e.message)
        }


        onUnknownError (e : unknown) {
        }


        // earliest point at which launcher options already have been applied
        async onLauncherOptionsAvailable () {
            this.logger.logLevel        = this.logLevel

            //--------------------------
            if (this.help) {
                this.write(this.helpScreenTemplate(
                    [
                        ...optionsToArray(this.$options),
                        ...optionsToArray(this.projectData ? this.projectData.options.$options : this.projectDescriptorClass.prototype.$options),
                        ...optionsToArray(this.projectData ? this.projectData.projectPlan.$options : this.testDescriptorClass.prototype.$options)
                    ]
                ))
            }

            if (this.version) {
                this.write(this.versionTemplate())
            }

            if (this.help || this.version) throw LauncherError.new({ exitCode : ExitCodes.DRY_RUN })

            //--------------------------
            this.contextProviders               = this.contextProviderConstructors.map(cls => cls.new({ launcher : this }))

            this.contextProviderSameContext     = ContextProviderSameContext.new({ launcher : this })

            await Promise.all(this.contextProviders.map(provider => provider.setup()))
        }


        async prepareLauncherOptions () : Promise<PrepareOptionsResult> {
            this.optionsBag     = OptionsBag.new({ input : this.inputArguments })

            const extractRes    = this.optionsBag.extractOptions(optionsToArray(this.$options))

            extractRes.values.forEach((value, option) => option.applyValue(this, value))

            const Minimatch         = minimatch.Minimatch

            this.includeMatches     = this.include.map(pattern => new Minimatch('**/' + pattern, { dot : true }))
            this.excludeMatches     = this.exclude.map(pattern => new Minimatch('**/' + pattern, { dot : true }))

            // TODO cleanup, need "reviver" concept on option
            // @ts-ignore
            if (isString(this.logLevel)) this.logLevel = LogLevel[ this.logLevel ]

            return { extractResult : extractRes, errors : [] }
        }


        prepareProjectOptions () : PrepareOptionsResult {
            const extractRes    = this.optionsBag.extractOptions(optionsToArray(this.projectData.options.$options))

            extractRes.values.forEach((value, option) => option.applyValue(this.projectData.options, value))

            return { extractResult : extractRes, errors : [] }
        }


        prepareTestDescriptorOptions () : PrepareOptionsResult {
            const extractRes    = this.optionsBag.extractOptions(optionsToArray(this.projectData.projectPlan.$options))

            extractRes.values.forEach((value, option) => option.applyValue(this.projectData.projectPlan, value))

            return { extractResult : extractRes, errors : [] }
        }


        async performSetupOnce ()  {
            if (!this.setupDone) {
                // setup may be already started (by another launch)
                await (this.setupPromise || (this.setupPromise = this.setup()))

                this.setupDone      = true
                this.setupPromise   = undefined
            }
        }


        async setup () {
            // extracting the launcher options from the input arguments (command line / URL search params)
            // at this point there might be no `projectData` yet (project is running in remote context)
            const prepareLauncherOptions        = await this.prepareLauncherOptions()

            await this.onLauncherOptionsAvailable()

            await this.setupProjectData()

            const prepareProjectOptions         = this.prepareProjectOptions()

            const prepareTestDescriptorOptions  = this.prepareTestDescriptorOptions()

            //-----------------------
            const errors : XmlElement[]     = [].concat(
                prepareLauncherOptions.extractResult.errors,
                prepareProjectOptions.extractResult.errors,
                prepareTestDescriptorOptions.extractResult.errors
            ).map(error => optionErrorTemplateByCode.get(error.error)(error)).concat(
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

            if (errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })

            //-----------------------
            const contextProviders          = this.getSuitableContextProviders(this.projectData.type)

            if (contextProviders.length === 0) throw LauncherError.new({
                message     : 'No suitable context providers found. Check the `--provider` option'
            })

            this.dispatcher         = this.dispatcherClass.new({
                launcher        : this,
                contextProviders
            })

            this.reporter       = this.reporterClass.new({
                launcher        : this,
                colorerClass    : this.colorerClass,
                styles          : this.styles
            })
        }


        async destroy () {
            await Promise.all(this.contextProviders.map(provider => provider.destroy()))
        }


        async setupProjectData () {
        }


        @local()
        async launchContinuously (projectPlanItemsToLaunch : TestDescriptor[]) {
            await this.performSetupOnce()

            projectPlanItemsToLaunch.forEach(desc => this.dispatcher.addPendingTest(desc))
        }


        @local()
        async launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) {
            await this.performSetupOnce()

            this.dispatcher.addPendingTest(desc, checkInfo)
        }


        async launchOnce (projectPlanItemsToLaunch : TestDescriptor[]) {
            await this.performSetupOnce()

            this.reporter.onTestSuiteStart()

            if (projectPlanItemsToLaunch.length) {
                const completed             = new Promise<any>(resolve => this.dispatcher.runningQueue.onCompletedHook.on(resolve))

                this.dispatcher.addRunOnceBatch(projectPlanItemsToLaunch)

                await completed
            } else {
                this.logger.error('No tests to run')
            }

            this.reporter.onTestSuiteFinish()
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

            return <div>
                <p><span class="accented">npx siesta URL [--option=value]</span></p>
                <p>URL should point to your project file. All options are optional.</p>

                {
                    groups.map(group => <div class="group">
                        <span class="option_group_name">{ '\n' + group.title + ':\n' + '━'.repeat(group.title.length + 1) }</span>

                        {
                            optionsByGroup.get(group).map(option => <div class="option">
                                <div class="option_name">{ option.printableDeclaration }</div>
                                <div class="indented">{ option.help }</div>
                                <p></p>
                            </div>)
                        }
                    </div>)
                }
            </div>
        }
    }
) {}
