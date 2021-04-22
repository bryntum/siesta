// @ts-ignore
import { isatty } from "https://deno.land/std@0.94.0/node/tty.ts"
// @ts-ignore
import * as path from "https://deno.land/std@0.94.0/path/mod.ts"
// @ts-ignore
import { encode } from "https://deno.land/std@0.83.0/encoding/utf8.ts"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextAttachable } from "../../context/ExecutionContext.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerDeno } from "../../jsx/ColorerDeno.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel, LogMethod } from "../../logger/Logger.js"
import { LoggerHookable } from "../../logger/LoggerHookable.js"
import { parse } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { stripBasename } from "../../util/Path.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { Context } from "../context/Context.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderDenoWorker } from "../context/context_provider/ContextProviderDenoWorker.js"
import { option } from "../option/Option.js"
import { ProjectDescriptor, ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ReporterDeno } from "../reporter/ReporterDeno.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { LogMessage } from "../test/TestResult.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupOutput, OptionsGroupPrimary, PrepareOptionsResult } from "./Launcher.js"
import { extractProjectInfo } from "./ProjectExtractor.js"


//---------------------------------------------------------------------------------------------------------------------
declare const Deno : any

//---------------------------------------------------------------------------------------------------------------------
export class LauncherDeno extends Mixin(
    [ Launcher, ExecutionContextAttachable ],
    (base : ClassUnion<typeof Launcher, typeof ExecutionContextAttachable>) => {

    class LauncherDeno extends base {
        logger                  : LoggerHookable            = LoggerHookable.new({ logLevel : LogLevel.warn })

        // region options
        maxWorkers      : number            = 4

        @option({
            type        : 'string',
            group       : OptionsGroupPrimary,
            help        : <span>
                Project file url. Can be either a regular filesystem path, or http-based URL, or a `file://` url
            </span>
        })
        project             : string            = ''

        @option({
            type        : 'boolean',
            group       : OptionsGroupOutput,
            defaultValue : () => false,
            help        : <div>
                Whether to suppress the output coloring. Also suppresses the progress bar and spinner.
                Automatically enforced if output stream is not a terminal.
            </div>
        })
        noColor         : boolean               = false
        // endregion


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderDenoWorker
        ]


        reporterClass   : typeof ReporterDeno               = ReporterDeno
        colorerClass    : typeof Colorer                    = ColorerDeno

        projectDescriptorClass : typeof ProjectDescriptor   = ProjectDescriptor
        testDescriptorClass : typeof TestDescriptor         = TestDescriptor


        initialize (props? : Partial<LauncherDeno>) {
            super.initialize(props)

            this.logger.onLogMessageHook.on((method : LogMethod, message : unknown[]) => {
                this.write(LogMessage.new({
                    type        : 'log',
                    level       : LogLevel[ method ],
                    message     : this.prepareLogMessage(...message)
                }).template(false))
            })
        }


        prepareLogMessage (...messages : unknown[]) : XmlNode[] {
            // if (messages.length === 1)
                return messages.map(message => isString(message) ? message : SerializerXml.serialize(message/*, this.descriptor.serializerConfig*/))
            // else
            //     return [ SerializerXml.serialize(messages/*, this.descriptor.serializerConfig*/) ]
        }


        getMaxLen () : number {
            return /*process.stdout.columns ??*/ Number.MAX_SAFE_INTEGER
        }


        doPrint (str : string) {
            Deno.stdout.writeSync(encode(str))
        }


        getEnvironmentByUrl (url : string) : EnvironmentType {
            return /^https?:/.test(url) ? 'browser' : 'nodejs'
        }


        // getSuitableContextProviders (environment : EnvironmentType) : ContextProvider[] {
        //     if (environment === 'browser') {
        //         const requestedProvider     = this.provider
        //
        //         return this.contextProviderBrowser.filter(provider =>
        //             !requestedProvider || (provider.constructor as typeof ContextProvider).providerName === requestedProvider)
        //     }
        //     else if (environment === 'nodejs') {
        //         return this.contextProviderNode
        //     }
        //     else if (this.project) {
        //         return this.getSuitableContextProviders(this.getEnvironmentByUrl(this.project))
        //     } else
        //         throw new Error("Can't determine suitable context providers")
        // }


        async onLauncherOptionsAvailable () {
            await super.onLauncherOptionsAvailable()

            if (this.noColor || !isatty(1)) {
                this.colorerClass       = ColorerNoop
                this.reporterClass      = ReporterDeno
            }

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
        }


        onLauncherError (e : LauncherError) {
            super.onLauncherError(e)

            Deno.exit(e.exitCode)
        }


        onUnknownError (e : any) {
            super.onUnknownError(e)

            console.log('Unhandled exception:', e?.stack || e)

            Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
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
            // // probably Puppeteer adds a SIGINT listener to `process`
            // // many workers may cause a console warning about having too many
            // // listeners, suppress that
            // process.setMaxListeners(Number.MAX_SAFE_INTEGER)
            //
            // const executionContext      = this.executionContext = ExecutionContextNode.new({
            //     overrideConsole     : false,
            //     overrideException   : false
            // })
            //
            // executionContext.setup()
            //
            // executionContext.attach(this)
            //
            // // this.onConsoleHook.on((launcher, type, text) => {
            // //     this.print(text.join(' ') + '\n')
            // // })
            //
            // this.onOutputHook.on((launcher, type, text) => {
            //     this.print(text)
            // })
            //
            // // this.onExceptionHook.on((launcher, type, exception : any) => {
            // //     this.print(String(exception?.stack || exception))
            // // })

            await super.setup()
        }


        async setupProjectData () {
            await super.setupProjectData()

            // `projectDescriptor` might be already provided
            // if project file is launched directly as node executable
            if (!this.projectData) {
                const projectUrl            = this.project = this.prepareProjectFileUrl(this.project)

                // if (/^https?:/i.test(projectUrl)) {
                //     throw new Error("Not supported")
                //
                //     // const contextProvider       = this.contextProviderBrowser[ 0 ]
                //     //
                //     // const context               = await contextProvider.createContext()
                //     //
                //     // await context.navigate(projectUrl)
                //     //
                //     // this.projectData            = await this.extractProjectData(context, projectUrl)
                // } else {
                    const contextProvider       = this.contextProviderSameContext

                    const context               = await contextProvider.createContext()

                    this.projectData            = await this.extractProjectData(context, projectUrl)
                // }
            }

            if (this.project) {
                this.projectData.projectPlan.url   = stripBasename(this.project)
            }
        }


        prepareProjectFileUrl (url : string) : string {
            if (/^https?:/i.test(url)) {
                return url
            }
            // else if (/^file:/.test(url)) {
            //     return path.resolve(fileURLToPath(url))
            // }
            else {
                // assume plain fs path here
                return path.resolve(url)
            }
        }


        setExitCode (code : ExitCodes) {
            // process.exitCode    = process.exitCode ?? code
        }


        static async run () {
            // process.on('unhandledRejection', (reason : any, promise) => {
            //     console.log('Unhandled promise rejection, reason:', reason?.stack || reason)
            //
            //     process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            // })

            const launcher  = this.new({
                inputArguments      : Deno.args
            })

            const launch        = await launcher.start()

            // launch && launcher.setExitCode(launch.exitCode)

            await launcher.destroy()

            Deno.exit(launch.exitCode)
        }
    }

    return LauncherDeno
}) {}

