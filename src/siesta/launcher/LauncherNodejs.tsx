import path from 'path'
import { fileURLToPath } from "url"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { Channel } from "../../rpc/channel/Channel.js"
import { ChannelNodeIpc } from "../../rpc/channel/ChannelNodeIpc.js"
import { parse } from "../../serializable/Serializable.js"
import { Environment } from "../common/Types.js"
import { Context } from "../context/Context.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderNodeChildProcess } from "../context/context_provider/ContextProviderNodeChildProcess.js"
import { ContextProviderNodePuppeteer } from "../context/context_provider/ContextProviderNodePuppeteer.js"
import { option, OptionGroup } from "../option/Option.js"
import { ProjectDescriptorNodejs, ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ReporterNodejsTerminal } from "../reporter/ReporterNodejsTerminal.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupOutput, OptionsGroupPrimary, PrepareOptionsResult } from "./Launcher.js"
import { extractProjectInfo } from "./ProjectExtractor.js"


//---------------------------------------------------------------------------------------------------------------------
export const OptionsGroupBrowser  = OptionGroup.new({
    name        : 'Browser',
    weight      : 900
})


//---------------------------------------------------------------------------------------------------------------------
export class LauncherNodejs extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) => {

    class LauncherNodejs extends base {

        @option({
            type        : 'string',
            group       : OptionsGroupPrimary,
            help        : <span>
                Project file url.
            </span>
        })
        project             : string            = ''

        @option({
            type        : 'boolean',
            group       : OptionsGroupOutput,
            help        : <div>
                Whether to suppress the output coloring. Also suppresses the progress bar and spinner.
                Automatically enforced if output stream is not a terminal.
            </div>
        })
        noColor         : boolean               = false


        @option({
            type        : 'boolean',
            group       : OptionsGroupBrowser,
            help        : <div>
                Whether to launch browser in the headless mode. Enabled by default. Supported by Chrome, Firefox, Puppeteer.
            </div>
        })
        headless        : boolean               = true


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupBrowser,
            help        : <div>
                The command-line arguments to be passed to the browser process being launched.
            </div>
        })
        browserArg      : string[]              = []

        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderNodePuppeteer, ContextProviderNodeChildProcess
        ]


        reporterClass   : typeof ReporterNodejs             = ReporterNodejsTerminal
        colorerClass    : typeof Colorer                    = ColorerNodejs

        projectDescriptorClass : typeof ProjectDescriptorNodejs   = ProjectDescriptorNodejs
        testDescriptorClass : typeof TestDescriptorNodejs   = TestDescriptorNodejs


        get targetContextChannelClass () : typeof Channel {
            return ChannelNodeIpc
        }


        getMaxLen () : number {
            return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
        }


        print (str : string) {
            process.stdout.write(str)
        }


        getEnvironmentByUrl (url : string) : Environment {
            return /^https?:/.test(url) ? 'browser' : 'nodejs'
        }


        getSuitableContextProviders (environment : Environment) : ContextProvider[] {
            if (environment === 'browser') {
                return this.contextProviderBrowser
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


        async prepareLauncherOptions () : Promise<PrepareOptionsResult> {
            const res               = await super.prepareLauncherOptions()

            const projectFileUrl    = this.project || this.argv[ 0 ]

            if (!projectFileUrl && !this.projectData) throw LauncherError.new({
                exitCode        : ExitCodes.INCORRECT_ARGUMENTS,
                annotation      : <div>
                    <p><span class="log_message_error"> ERROR </span> <span class="accented">No argument for project file url </span></p>
                    <div>
                        You can specify the project file location with <span class="option_name">--project</span> option
                        or by providing a positional argument:
                        <p class="indented">
                            npx siesta --project ./siesta.js
                        </p>
                        <p class="indented">
                            npx siesta ./siesta.js
                        </p>
                    </div>
                </div>
            })

            if (!this.project) this.project = this.argv[ 0 ]

            return res
        }


        onLauncherError (e : LauncherError) {
            super.onLauncherError(e)

            process.exitCode = e.exitCode
        }


        onUnknownError (e : unknown) {
            super.onUnknownError(e)

            console.log('Unhandled exception:', e)

            process.exit(ExitCodes.UNHANDLED_EXCEPTION)
        }


        async extractProjectData (context : Context, projectUrl : string) : Promise<ProjectSerializableData> {
            try {
                return parse(await context.evaluateBasic(extractProjectInfo, projectUrl))
            } catch (e) {
                const [ message, stack ]    = e.message.split(String.fromCharCode(0))

                throw LauncherError.new({
                    annotation      : <div>
                        <span class="log_message_error"> ERROR </span> <span class="accented">{ message }</span>
                        <div>
                            { stack }
                        </div>
                    </div>,
                    exitCode        : ExitCodes.EXCEPTION_IN_PROJECT_FILE
                })
            } finally {
                await context.destroy()
            }
        }


        async setup () {
            // probably Puppeteer adds a SIGINT listener to `process`
            // many workers may cause a console warning about having too many
            // listeners, suppress that
            process.setMaxListeners(Number.MAX_SAFE_INTEGER)

            await super.setup()
        }


        async setupProjectData () {
            await super.setupProjectData()

            // `projectDescriptor` might be already provided
            // if project file is launched directly as node executable
            if (!this.projectData) {
                const projectUrl            = this.project = this.prepareProjectFileUrl(this.project)

                if (/^https?:/i.test(projectUrl)) {
                    const contextProvider       = this.contextProviderBrowser[ 0 ]

                    const context               = await contextProvider.createContext()

                    await context.navigate(projectUrl)

                    this.projectData            = await this.extractProjectData(context, projectUrl)
                } else {
                    const contextProvider       = this.contextProviderSameContext

                    const context               = await contextProvider.createContext()

                    this.projectData            = await this.extractProjectData(context, projectUrl)
                }
            }

            if (this.project) {
                this.projectData.projectPlan.url   = this.project.replace(/\/[^/]*?$/, '')
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


        static async run () {
            process.on('unhandledRejection', (reason, promise) => {
                console.log('Unhandled promise rejection, reason:', reason)

                process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })

            const launcher  = this.new({
                inputArguments      : process.argv.slice(2)
            })


            const launch        = await launcher.start()

            // we just set the `exitCode` property and not call `process.exit()` directly,
            // because some output might not be processed yet
            // slight risk of leaking some async cyclic process
            process.exitCode    = process.exitCode ?? launch.getExitCode()
        }
    }

    return LauncherNodejs
}) {}
