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
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderDenoWorker } from "../context/context_provider/ContextProviderDenoWorker.js"
import { ProjectDescriptorDeno } from "../project/ProjectDescriptor.js"
import { ReporterDeno } from "../reporter/ReporterDeno.js"
import { ReporterDenoTerminal } from "../reporter/ReporterDenoTerminal.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { ExitCodes, Launcher, LauncherError } from "./Launcher.js"
import { LauncherTerminal } from "./LauncherTerminal.js"


//---------------------------------------------------------------------------------------------------------------------
declare const Deno : any

//---------------------------------------------------------------------------------------------------------------------
export class LauncherDeno extends Mixin(
    [ Launcher, LauncherTerminal, ExecutionContextAttachable ],
    (base : ClassUnion<typeof Launcher, typeof LauncherTerminal, typeof ExecutionContextAttachable>) => {

    class LauncherDeno extends base {
        // region options
        maxWorkers      : number            = 4

        // region options
        // endregion


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderDenoWorker
        ]


        reporterClass   : typeof ReporterDeno               = ReporterDenoTerminal
        colorerClass    : typeof Colorer                    = ColorerDeno

        projectDescriptorClass : typeof ProjectDescriptorDeno   = ProjectDescriptorDeno
        testDescriptorClass : typeof TestDescriptorDeno         = TestDescriptorDeno


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
            else if (/^file:/.test(url)) {
                return path.resolve(path.fromFileUrl(url))
            }
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

