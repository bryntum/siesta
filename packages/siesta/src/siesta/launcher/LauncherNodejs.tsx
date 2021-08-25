import { startDevServer } from "@web/dev-server"
import path from "path"
import { LaunchOptions } from "playwright/types/types.js"
import { fileURLToPath } from "url"
import ws from "ws"
import { siestaPackageRootUrl } from "../../../index.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextAttachable } from "../../context/ExecutionContext.js"
import { ExecutionContextNode } from "../../context/ExecutionContextNode.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { MediaNodeWebSocketParent } from "../../rpc/media/MediaNodeWebSocketParent.js"
import { ServerNodeWebSocket } from "../../rpc/server/ServerNodeWebSocket.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { browserType } from "../common/PlaywrightHelpers.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderNodeChildProcess } from "../context/context_provider/ContextProviderNodeChildProcess.js"
import { ContextProviderNodePlaywright } from "../context/context_provider/ContextProviderNodePlaywright.js"
import { ContextProviderNodePuppeteer } from "../context/context_provider/ContextProviderNodePuppeteer.js"
import { ProjectDescriptorNodejs } from "../project/ProjectDescriptor.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ReporterNodejsTerminal } from "../reporter/ReporterNodejsTerminal.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeNodejs } from "../runtime/RuntimeNodejs.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { DashboardConnectorServer } from "./DashboardConnector.js"
import { Dispatcher } from "./Dispatcher.js"
import { DispatcherNodejs } from "./DispatcherNodejs.js"
import { ExitCodes, Launcher, LauncherError } from "./Launcher.js"
import { LauncherDescriptorNodejs } from "./LauncherDescriptorNodejs.js"
import { LauncherTerminal } from "./LauncherTerminal.js"


//---------------------------------------------------------------------------------------------------------------------
[ process.stdout, process.stderr ].forEach((stream : any) => stream._handle?.setBlocking(true))


export class LauncherNodejs extends Mixin(
    [ Launcher, LauncherDescriptorNodejs, LauncherTerminal, ExecutionContextAttachable ],
    (base : ClassUnion<typeof Launcher, typeof LauncherDescriptorNodejs, typeof LauncherTerminal, typeof ExecutionContextAttachable>) =>

    class LauncherNodejs extends base {
        descriptorClass         : typeof LauncherDescriptorNodejs = LauncherDescriptorNodejs
        dispatcherClass         : typeof Dispatcher         = DispatcherNodejs

        executionContext        : ExecutionContextNode      = undefined


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderNodePlaywright, ContextProviderNodePuppeteer, ContextProviderNodeChildProcess
        ]


        reporterClass           : typeof ReporterNodejs             = ReporterNodejsTerminal
        colorerClass            : typeof Colorer                    = ColorerNodejs

        runtimeClass            : typeof Runtime                    = RuntimeNodejs

        projectDescriptorClass  : typeof ProjectDescriptorNodejs    = ProjectDescriptorNodejs
        testDescriptorClass     : typeof TestDescriptorNodejs       = TestDescriptorNodejs


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
            else if (environment === 'nodejs' || environment === 'isomorphic') {
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


        setExitCode (code : ExitCodes) {
            process.exitCode    = process.exitCode ?? code
        }


        async launchDashboardUI () {
            this.reporter.disabled  = true

            const launchOptions : LaunchOptions  = { headless : false }

            if (this.browser === 'chrome') {
                launchOptions.args        = [ '--start-maximized', '--allow-file-access-from-files', '--disable-web-security' ]
            }

            const browser       = await browserType(this.browser).launch(launchOptions)
            const page          = await browser.newPage({ viewport : null })

            let webServer : UnwrapPromise<ReturnType<typeof startDevServer>>

            if (this.getEnvironmentByUrl(this.project) === 'browser') {

            } else {
                let connectedPort : DashboardConnectorServer   = undefined

                page.on('close', async () => {
                    await Promise.all([
                        browser.close(),
                        webServer.stop(),
                        connectedPort ? connectedPort.disconnect() : Promise.resolve()
                    ])

                    await wsServer.stopWebSocketServer()
                })

                webServer               = await startDevServer({
                    config : {
                        nodeResolve : true
                    },
                    logStartMessage     : false
                })

                const address           = webServer.server.address()
                const webPort           = !isString(address) ? address.port : undefined

                if (webPort === undefined) throw new Error("Address should be available")

                this.write(<div>
                    <p>Local web server launched</p>
                    <p class="indented">Root dir : <span class="accented">{ process.cwd() }</span></p>
                    <p class="indented">Address  : <span class="accented">http://localhost:{ webPort }</span></p>
                </div>)

                const wsServer          = new ServerNodeWebSocket()
                const wsPort            = await wsServer.startWebSocketServer()

                wsServer.onConnectionHook.on(async (self, socket) => {
                    if (connectedPort) {
                        await connectedPort.disconnect()
                        connectedPort       = undefined
                    }

                    const port              = this.dashboardConnector = connectedPort = DashboardConnectorServer.new({ launcher : this })
                    const media             = MediaNodeWebSocketParent.new()

                    port.media              = media
                    media.socket            = socket
                    port.handshakeType      = 'parent_first'

                    await port.connect()

                    this.logger.debug('Launcher connected to dashboard')

                    await port.startDashboard(this.projectData, this.getDescriptor())

                    this.logger.debug('Dashboard started')
                })

                const relPath           = path.relative('./', fileURLToPath(`${ siestaPackageRootUrl }resources/dashboard/index.html`))

                page.goto(`http://localhost:${ webPort }/${ relPath }?port=${ wsPort }`)
            }
        }


        static async run () {
            process.on('unhandledRejection', (reason : any, promise) => {
                console.log('Unhandled promise rejection, reason:', reason?.stack || reason)

                process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })

            const launcher  = this.new({
                inputArguments      : process.argv.slice(2)
            })

            await launcher.start()

            await launcher.destroy()
        }
    }
) {}

