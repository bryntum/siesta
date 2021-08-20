// @ts-ignore
import { encode } from "https://deno.land/std@0.83.0/encoding/utf8.ts"
// @ts-ignore
import * as path from "https://deno.land/std@0.94.0/path/mod.ts"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextAttachable } from "../../context/ExecutionContext.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerDeno } from "../../jsx/ColorerDeno.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { stripBasename } from "../../util/Path.js"
import { EnvironmentType } from "../common/Environment.js"
import { Context } from "../context/Context.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderDenoWorker } from "../context/context_provider/ContextProviderDenoWorker.js"
import { ProjectDescriptorDeno, ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ReporterDeno } from "../reporter/ReporterDeno.js"
import { ReporterDenoTerminal } from "../reporter/ReporterDenoTerminal.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeDeno } from "../runtime/RuntimeDeno.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { ExitCodes, Launcher, LauncherError } from "./Launcher.js"
import { LauncherTerminal } from "./LauncherTerminal.js"


//---------------------------------------------------------------------------------------------------------------------
declare const Deno : any

//---------------------------------------------------------------------------------------------------------------------
export class LauncherDeno extends Mixin(
    [ Launcher, LauncherTerminal, ExecutionContextAttachable ],
    (base : ClassUnion<typeof Launcher, typeof LauncherTerminal, typeof ExecutionContextAttachable>) =>

    class LauncherDeno extends base {
        exitCode                    : ExitCodes                 = undefined

        // region options
        maxWorkers      : number            = 4

        // region options
        // endregion


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderDenoWorker
        ]


        reporterClass           : typeof ReporterDeno               = ReporterDenoTerminal
        colorerClass            : typeof Colorer                    = ColorerDeno

        runtimeClass            : typeof Runtime                    = RuntimeDeno

        projectDescriptorClass  : typeof ProjectDescriptorDeno      = ProjectDescriptorDeno
        testDescriptorClass     : typeof TestDescriptorDeno         = TestDescriptorDeno


        getMaxLen () : number {
            return /*process.stdout.columns ??*/ Number.MAX_SAFE_INTEGER
        }


        doPrint (str : string) {
            Deno.stdout.writeSync(encode(str))
        }


        getEnvironmentByUrl (url : string) : EnvironmentType {
            return /^https?:/.test(url) ? 'browser' : 'deno'
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

            if (this.noColor || !Deno.isatty(Deno.stdout)) {
                this.colorerClass       = ColorerNoop
                this.reporterClass      = ReporterDeno
            }
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
            if (!this.projectData) {
                const projectUrl            = this.project = this.prepareProjectFileUrl(this.project)

                if (/^https?:/i.test(projectUrl)) {
                    throw new Error("To run the tests in browser, please use Node.js launcher: `npx siesta PROJECT_URL`")
                }
            }

            await super.setupProjectData()
        }


        async extractProjectData (context : Context, projectUrl : string) : Promise<ProjectSerializableData> {
            // Deno needs to resolve the project url to `file://`, because it might be served from the online repository,
            // which resides on different domain, so that `/home/user/...` url is resolved to `https://jsdelivr.com/home/user/...`
            return super.extractProjectData(context, 'file://' + projectUrl)
        }


        // setup the project plan root as `file://` url
        prepareProjectPlanRoot (dirName : string) : string {
            return 'file://' + dirName
        }

        // for Deno, we create a proper separate context for project file
        async setupProjectDataFromProjectFile (projectUrl : string) {
            const contextProvider               = this.contextProviders[ 0 ]

            const context                       = await contextProvider.createContext()

            this.projectData                    = await this.extractProjectData(context, projectUrl)
            this.projectData.projectPlan.url    = this.prepareProjectPlanRoot(stripBasename(this.project))
        }


        setExitCode (code : ExitCodes) {
            this.exitCode   = code
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

            await launcher.start()
            await launcher.destroy()

            Deno.exit(launcher.exitCode)
        }
    }
) {}

