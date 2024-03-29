import minimatch, { IMinimatch } from "../../../web_modules/minimatch.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { Logger, LogLevel } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { objectEntriesDeep } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { IsolationLevel } from "../common/IsolationLevel.js"
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
import { DashboardConnectorServer } from "./DashboardConnector.js"
import { Dispatcher } from "./Dispatcher.js"
import { LauncherError, LauncherRestartOnCodeCoverage } from "./LauncherError.js"
import { ExitCodes } from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const OptionsGroupFiltering  = OptionGroup.new({
    name        : 'filter',
    title       : 'Filtering',
    weight      : 100
})

export const OptionsGroupPrimary  = OptionGroup.new({
    name        : 'launcher',
    title       : 'Primary launcher options',
    weight      : 0
})

export const OptionsGroupOutput  = OptionGroup.new({
    name        : 'output',
    title       : 'Output',
    weight      : 200
})

export const OptionsGroupReport  = OptionGroup.new({
    name        : 'report',
    title       : 'Reports',
    weight      : 300
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const optionsToArray    = (obj : Record<string, Option>) : Option[] => objectEntriesDeep(obj).map(entry => entry[ 1 ])


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type PrepareOptionsResult = {
    extractResult       : ExtractOptionsResult,
    errors              : XmlElement[]
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'LauncherDescriptor' })
export class LauncherDescriptor extends Mixin(
    [ Serializable, HasOptions, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof Base>) =>

    class LauncherDescriptor extends base {

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
            type        : 'enum',
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

        @option({
            type        : 'enum',
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


        @option({
            type        : 'enum',
            enumeration : [ 'dark', 'light', 'universal', 'accessible' ],
            defaultValue : () => 'universal',
            group       : OptionsGroupOutput,
            help        : <span>
                The output theme.
            </span>
        })
        theme           : string            = 'universal'
    }
) {}


export class Launcher extends Mixin(
    [ LauncherDescriptor, ConsoleXmlRenderer, HasRuntimeAccess ],
    (base : ClassUnion<typeof LauncherDescriptor, typeof ConsoleXmlRenderer, typeof HasRuntimeAccess>) =>

    class Launcher extends base {
        projectData             : ProjectSerializableData   = undefined

        $logger                 : Logger                    = LoggerConsole.new({ logLevel : LogLevel.warn })

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        inputArguments          : string[]                  = []

        optionsBag              : OptionsBag                = undefined

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        dispatcherClass         : typeof Dispatcher         = Dispatcher

        projectDescriptorClass  : typeof ProjectDescriptor  = ProjectDescriptor

        testDescriptorClass     : typeof TestDescriptor     = TestDescriptor

        reporterClass           : typeof Reporter           = undefined

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        includeMatches          : IMinimatch[]              = []
        excludeMatches          : IMinimatch[]              = []

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        dispatcher              : Dispatcher                = undefined

        reporter                : Reporter                  = undefined

        dashboardConnector      : DashboardConnectorServer  = undefined
        isClosingDashboard      : boolean                   = false

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        setupDone               : boolean                   = false
        setupPromise            : Promise<any>              = undefined

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        contextProviderConstructors : (typeof ContextProvider)[]    = []

        contextProviders            : ContextProvider[]             = []

        contextProviderSameContext  : ContextProviderSameContext    = undefined

        keepNLastResults        : number                    = 0


        get logger () : this[ '$logger' ] {
            return this.$logger
        }

        set logger (value : this[ '$logger' ]) {
            this.$logger    = value
        }


        get contextProviderBrowser () : ContextProviderTargetBrowser[] {
            return this.contextProviders.filter(provider => provider instanceof ContextProviderTargetBrowser) as ContextProviderTargetBrowser[]
        }

        get contextProviderNode () : ContextProvider[] {
            return this.contextProviders.filter(provider => provider.supportsNodejs)
        }

        get contextProviderDeno () : ContextProvider[] {
            return this.contextProviders.filter(provider => provider.supportsDeno)
        }


        descriptorClass         : typeof LauncherDescriptor     = LauncherDescriptor

        getDescriptor () : InstanceType<this[ 'descriptorClass' ]> {
            const descriptorClass       = this.descriptorClass as this[ 'descriptorClass' ]

            const config                = optionsToArray(this.$options).reduce((acc : Record<string, any>, option : Option) => {
                acc[ option.name ] = this[ option.name ]
                return acc
            }, {}) as Partial<InstanceType<this[ 'descriptorClass' ]>>

            return descriptorClass.new(config)
        }


        getEnvironmentByUrl (url : string) : EnvironmentType {
            return /^https?:/.test(url) ? 'browser' : 'nodejs'
        }


        getSuitableContextProviders (projectType : EnvironmentType, requestedEnvironmentType : EnvironmentType) : ContextProvider[] {
            if (requestedEnvironmentType === 'browser')
                return this.contextProviderBrowser
            else if (requestedEnvironmentType === 'nodejs')
                return this.contextProviderNode
            else if (requestedEnvironmentType === 'deno')
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

                await this.finalize()
            } catch (e) {
                if (e instanceof LauncherRestartOnCodeCoverage) return

                if (e instanceof LauncherError) {
                    this.onLauncherError(e)
                } else {
                    this.onUnknownError(e)
                }
            }
        }


        // finalization hook, only called after successful launch
        async finalize () {
        }


        async doStart () {
            if (this.ui) {
                await this.launchDashboardUI()
            } else {
                await this.launchOnce(this.getDescriptorsToLaunch())

                this.setExitCode(this.computeExitCode())
            }
        }


        exit () {
        }


        async launchDashboardUI () {
            throw new Error("Abstract method called")
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

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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


        processPrepareOptionsResult (res : PrepareOptionsResult) {
            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            const errors : XmlElement[]     = res.extractResult.errors.map(
                error => optionErrorTemplateByCode.get(error.error)(error)
            ).concat(
                res.errors
            )

            errors.forEach(error => this.write(error))

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            const warnings                  = res.extractResult.warnings

            warnings.forEach(warning => this.write(optionWarningTemplateByCode.get(warning.warning)(warning)))

            if (errors.length) throw LauncherError.new({ exitCode : ExitCodes.INCORRECT_ARGUMENTS })
        }


        async setup () {
            // extracting the launcher options from the input arguments (command line / URL search params)
            // at this point there might be no `projectData` yet (project is running in remote context)
            const prepareLauncherOptions        = await this.prepareLauncherOptions()

            await this.onLauncherOptionsAvailable()

            this.processPrepareOptionsResult(prepareLauncherOptions)

            try {
                await this.setupProjectData()
            } catch (e) {
                if (e instanceof LauncherError) throw e

                throw LauncherError.new({
                    message : 'Could not extract project file information. Dev web server is not running?\n' + e.stack
                })
            }

            const prepareProjectOptions         = this.prepareProjectOptions()
            const prepareTestDescriptorOptions  = this.prepareTestDescriptorOptions()

            this.processPrepareOptionsResult(prepareProjectOptions)
            this.processPrepareOptionsResult(prepareTestDescriptorOptions)

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            const warnings                  = [
                ...CI(this.optionsBag.entries).map(entry => entry.key).uniqueOnly().map(optionName => {
                    return {
                        warning     : OptionsParseWarningCodes.UnknownOption,
                        option      : Option.new({ name : optionName })
                    }
                })
            ]

            warnings.forEach(warning => this.write(optionWarningTemplateByCode.get(warning.warning)(warning)))

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            const contextProviders          = this.getSuitableContextProviders(
                this.projectData.type,
                this.getEnvironmentByUrl(this.project)
            )

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


        async setupProjectData (avoidSameContext? : boolean) {
        }


        async launchContinuously (projectPlanItemsToLaunch : TestDescriptor[], isolationOverride? : IsolationLevel) {
            await this.performSetupOnce()

            projectPlanItemsToLaunch.forEach(desc => this.dispatcher.addPendingTest(desc, undefined, isolationOverride))
        }


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

            groups.sort((group1, group2) => group1.weight - group2.weight)

            return <div>
                <p><span class="accented">npx siesta URL [--option=value]</span></p>
                <p>URL should point to your project file. All options are optional.</p>

                {
                    groups.map(group => <div class="group">
                        <span class="option_group_name">{ '\n' + group.title + ':\n' + '━'.repeat(group.title.length + 1) }</span>

                        {
                            optionsByGroup.get(group).map(option => option.hideInHelp
                                ? null
                                : <div className="option">
                                    <div className="option_name">{option.printableDeclaration}</div>
                                    <div className="indented">{option.help}</div>
                                    <p></p>
                                </div>
                            )
                        }
                    </div>)
                }
            </div>
        }
    }
) {}
