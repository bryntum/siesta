import fs from "fs"
import glob from "glob"
import path from 'path'
import { fileURLToPath } from "url"
import { ProjectNodejs } from "../../../nodejs.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextAttachable } from "../../context/ExecutionContext.js"
import { ExecutionContextNode } from "../../context/ExecutionContextNode.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { stripBasename } from "../../util/Path.js"
import { EnvironmentType } from "../common/Environment.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderNodeChildProcess } from "../context/context_provider/ContextProviderNodeChildProcess.js"
import { ContextProviderNodePlaywright } from "../context/context_provider/ContextProviderNodePlaywright.js"
import { ContextProviderNodePuppeteer } from "../context/context_provider/ContextProviderNodePuppeteer.js"
import { option, OptionGroup } from "../option/Option.js"
import { ProjectDescriptorNodejs } from "../project/ProjectDescriptor.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ReporterNodejsTerminal } from "../reporter/ReporterNodejsTerminal.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupPrimary } from "./Launcher.js"
import { LauncherTerminal } from "./LauncherTerminal.js"


//---------------------------------------------------------------------------------------------------------------------
[ process.stdout, process.stderr ].forEach((stream : any) => stream._handle?.setBlocking(true))

//---------------------------------------------------------------------------------------------------------------------
export const OptionsGroupBrowser  = OptionGroup.new({
    name        : 'browser',
    title       : 'Browser',
    weight      : 900
})


//---------------------------------------------------------------------------------------------------------------------
export class LauncherNodejs extends Mixin(
    [ Launcher, LauncherTerminal, ExecutionContextAttachable ],
    (base : ClassUnion<typeof Launcher, typeof LauncherTerminal, typeof ExecutionContextAttachable>) => {

    class LauncherNodejs extends base {
        executionContext        : ExecutionContextNode      = undefined

        // region options
        @option({
            type        : 'boolean',
            group       : OptionsGroupBrowser,
            defaultValue : () => true,
            help        : <div>
                Whether to launch browser in the headless mode. Enabled by default.
                Supported by Chrome, Firefox with all providers, and for all browsers in Puppeteer and Playwright providers.
            </div>
        })
        headless        : boolean               = true


        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'nodejs', 'deno', 'playwright', 'puppeteer' ],
            group       : OptionsGroupPrimary,
            help        : <div>
                The context provider to use to launch the tests. By default its `node` for the Node.js test suites,
                and `playwright` for browser.
            </div>
        })
        provider        : string                = undefined


        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'chrome', 'firefox', 'edge', 'safari' ],
            group       : OptionsGroupBrowser,
            defaultValue : () => 'chrome',
            help        : <div>
                The browser where the tests should be launched. This option is only used when launching browser-based projects.
            </div>
        })
        browser        : string                 = 'chrome'


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupBrowser,
            help        : <div>
                The command-line arguments to be passed to the browser process being launched.
            </div>
        })
        browserArg      : string[]              = []
        // endregion


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderNodePlaywright, ContextProviderNodePuppeteer, ContextProviderNodeChildProcess
        ]


        reporterClass   : typeof ReporterNodejs             = ReporterNodejsTerminal
        colorerClass    : typeof Colorer                    = ColorerNodejs

        projectDescriptorClass : typeof ProjectDescriptorNodejs   = ProjectDescriptorNodejs
        testDescriptorClass : typeof TestDescriptorNodejs   = TestDescriptorNodejs


        getMaxLen () : number {
            return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
        }


        doPrint (str : string) {
            this.executionContext.stdOutWriteOriginal.call(process.stdout, str)
        }


        getEnvironmentByUrl (url : string) : EnvironmentType {
            return /^https?:/.test(url) ? 'browser' : 'nodejs'
        }


        getSuitableContextProviders (environment : EnvironmentType) : ContextProvider[] {
            if (environment === 'browser') {
                const requestedProvider     = this.provider

                return this.contextProviderBrowser.filter(provider =>
                    !requestedProvider || (provider.constructor as typeof ContextProvider).providerName === requestedProvider)
            }
            else if (environment === 'nodejs') {
                return this.contextProviderNode
            }
            else if (this.project) {
                return this.getSuitableContextProviders(this.getEnvironmentByUrl(this.project))
            } else
                throw new Error("Can't determine suitable context providers")
        }


        async onLauncherOptionsAvailable () {
            await super.onLauncherOptionsAvailable()

            if (this.noColor || !process.stdout.isTTY) {
                this.colorerClass       = ColorerNoop
                this.reporterClass      = ReporterNodejs
            }
        }


        onLauncherError (e : LauncherError) {
            super.onLauncherError(e)

            process.exitCode = e.exitCode
        }


        onUnknownError (e : any) {
            super.onUnknownError(e)

            console.log('Unhandled exception:', e?.stack || e)

            process.exit(ExitCodes.UNHANDLED_EXCEPTION)
        }


        async setup () {
            // probably Puppeteer adds a SIGINT listener to `process`
            // many workers may cause a console warning about having too many
            // listeners, suppress that
            process.setMaxListeners(Number.MAX_SAFE_INTEGER)

            const executionContext      = this.executionContext = ExecutionContextNode.new({
                overrideConsole     : false,
                overrideException   : false
            })

            executionContext.setup()

            executionContext.attach(this)

            // this.onConsoleHook.on((launcher, type, text) => {
            //     this.print(text.join(' ') + '\n')
            // })

            this.onOutputHook.on((launcher, type, text) => {
                this.print(text)
            })

            // this.onExceptionHook.on((launcher, type, exception : any) => {
            //     this.print(String(exception?.stack || exception))
            // })

            await super.setup()
        }

        // TODO need to abstract the OS-specific parts of this method, like "globbing", "fs.statSync"
        // and move this method to the LauncherTerminal, to share with Deno launcher, then remove
        // this method in LauncherDeno
        async setupProjectData () {
            await super.setupProjectData()

            // `projectDescriptor` might be already provided
            // if project file is launched directly as node executable
            if (!this.projectData) {
                const projectUrl                = this.project

                // what is passed as the 1st argument for the launcher?
                if (glob.hasMagic(projectUrl)) {
                    // glob for test files
                    const project               = ProjectNodejs.new({ title : projectUrl, baseUrl : process.cwd() })

                    project.planGlob(projectUrl)

                    this.projectData                    = project.asProjectSerializableData()
                    this.projectData.projectPlan.url    = process.cwd()
                }
                else {
                    // non-glob - either project file url (https: or file:) or test file name

                    const projectUrl            = this.project = this.prepareProjectFileUrl(this.project)

                    if (/^https?:/i.test(projectUrl)) {
                        const contextProvider       = this.contextProviderBrowser[ 0 ]

                        const context               = await contextProvider.createContext()

                        await context.navigate(projectUrl)

                        this.projectData                    = await this.extractProjectData(context, projectUrl)
                        this.projectData.projectPlan.url    = stripBasename(this.project)
                    } else {
                        const stats     = fs.statSync(projectUrl)

                        if (stats.isDirectory()) {
                            const project               = ProjectNodejs.new({ title : projectUrl, baseUrl : process.cwd() })

                            project.planDir(projectUrl)

                            this.projectData                    = project.asProjectSerializableData()
                            this.projectData.projectPlan.url    = process.cwd()
                        }
                        else if (stats.isFile()) {
                            if (/\.t\.m?js/.test(projectUrl)) {
                                // test file name
                                const project               = ProjectNodejs.new({ title : projectUrl, launchType : 'test', baseUrl : process.cwd() })

                                project.planFile(projectUrl)

                                this.projectData                    = project.asProjectSerializableData()
                                this.projectData.projectPlan.url    = process.cwd()
                            } else {
                                // finally - project file name
                                const contextProvider       = this.contextProviderSameContext

                                const context               = await contextProvider.createContext()

                                this.projectData                    = await this.extractProjectData(context, projectUrl)
                                this.projectData.projectPlan.url    = stripBasename(this.project)
                            }
                        }
                    }
                }
            }
        }


        prepareProjectFileUrl (url : string) : string {
            if (/^https?:/i.test(url)) {
                return url
            }
            else if (/^file:/.test(url)) {
                return path.resolve(fileURLToPath(url))
            }
            else {
                // assume plain fs path here
                return path.resolve(url)
            }
        }


        setExitCode (code : ExitCodes) {
            process.exitCode    = process.exitCode ?? code
        }


        static async run () {
            process.on('unhandledRejection', (reason : any, promise) => {
                console.log('Unhandled promise rejection, reason:', reason?.stack || reason)

                process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })

            const launcher  = this.new({
                inputArguments      : process.argv.slice(2)
            })


            const launch        = await launcher.start()

            launch && launcher.setExitCode(launch.exitCode)

            await launcher.destroy()
        }
    }

    return LauncherNodejs
}) {}

