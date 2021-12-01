import { startDevServer } from "@web/dev-server"
import path from "path"
import { LaunchOptions, Page } from "playwright/index.js"
import { fileURLToPath } from "url"
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
import { browserType } from "../../util_browser/PlaywrightHelpers.js"
import { EnvironmentType } from "../common/Environment.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderDashboardIframe } from "../context/context_provider/ContextProviderDashboardIframe.js"
import { ContextProviderNodeChildProcess } from "../context/context_provider/ContextProviderNodeChildProcess.js"
import { ContextProviderNodePlaywright } from "../context/context_provider/ContextProviderNodePlaywright.js"
import { ProjectDescriptorNodejs } from "../project/ProjectDescriptor.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ReporterNodejsTerminal } from "../reporter/ReporterNodejsTerminal.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeNodejs } from "../runtime/RuntimeNodejs.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { DashboardConnectorServer } from "./DashboardConnector.js"
import { Dispatcher } from "./Dispatcher.js"
import { DispatcherNodejs } from "./DispatcherNodejs.js"
import { Launcher } from "./Launcher.js"
import { LauncherDescriptorNodejs } from "./LauncherDescriptorNodejs.js"
import { LauncherError } from "./LauncherError.js"
import { LauncherTerminal } from "./LauncherTerminal.js"
import { ExitCodes } from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ process.stdout, process.stderr ].forEach((stream : any) => stream._handle?.setBlocking(true))


export class LauncherNodejs extends Mixin(
    [ Launcher, LauncherDescriptorNodejs, LauncherTerminal, ExecutionContextAttachable ],
    (base : ClassUnion<typeof Launcher, typeof LauncherDescriptorNodejs, typeof LauncherTerminal, typeof ExecutionContextAttachable>) =>

    class LauncherNodejs extends base {
        descriptorClass         : typeof LauncherDescriptorNodejs = LauncherDescriptorNodejs
        dispatcherClass         : typeof Dispatcher         = DispatcherNodejs

        executionContext        : ExecutionContextNode      = undefined


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderNodePlaywright,
            ContextProviderDashboardIframe,
            // ContextProviderNodePuppeteer,
            ContextProviderNodeChildProcess,
        ]


        reporterClass           : typeof ReporterNodejs             = ReporterNodejsTerminal
        colorerClass            : typeof Colorer                    = ColorerNodejs

        runtimeClass            : typeof Runtime                    = RuntimeNodejs

        projectDescriptorClass  : typeof ProjectDescriptorNodejs    = ProjectDescriptorNodejs
        testDescriptorClass     : typeof TestDescriptorNodejs       = TestDescriptorNodejs

        dashboardPage           : Page          = undefined


        getMaxLen () : number {
            return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
        }


        doPrint (str : string) {
            this.executionContext.stdOutWriteOriginal.call(process.stdout, str)
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
        //     else if (environment === 'nodejs' || environment === 'isomorphic') {
        //         return this.contextProviderNode
        //     }
        //     else if (this.project) {
        //         return this.getSuitableContextProviders(this.getEnvironmentByUrl(this.project))
        //     } else
        //         throw new Error("Can't determine suitable context providers")
        // }


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
            let done : () => any

            const donePromise       = new Promise<void>(resolve => done = resolve)

            this.reporter.disabled  = true

            const launchOptions : LaunchOptions  = { headless : false }

            if (this.browser === 'chrome') {
                // the `devtools` option seems to be only supported for Chrome
                launchOptions.devtools  = true
                launchOptions.args      = [ '--start-maximized' ]
            }

            const browser       = await browserType(this.browser).launch(launchOptions)
            const page          = this.dashboardPage =
                await browser.newPage({ viewport : null, ignoreHTTPSErrors : true, bypassCSP : true })

            let webServer : UnwrapPromise<ReturnType<typeof startDevServer>>

            const isBrowserProject  = this.getEnvironmentByUrl(this.project) === 'browser'

            if (isBrowserProject && this.keepNLastResults === 0) {
                this.keepNLastResults   = 5
            }

            let connectedPort : DashboardConnectorServer   = undefined

            page.on('close', async () => {
                this.isClosingDashboard     = true

                await this.dispatcher.cleanupQueue.clearAll()

                await Promise.allSettled([
                    browser.close(),
                    webServer.stop(),
                    connectedPort?.disconnect(true) ?? Promise.resolve()
                ])

                await wsServer.stopWebSocketServer()

                done()
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
                <p>Dashboard web server launched</p>
                <p class="indented">Root dir : <span class="accented">{ process.cwd() }</span></p>
                <p class="indented">Address  : <span class="accented">http://localhost:{ webPort }</span></p>
            </div>)

            const wsServer          = new ServerNodeWebSocket()
            const wsPort            = await wsServer.startWebSocketServer()

            let counter             = 0

            wsServer.onConnectionHook.on(async (self, socket) => {
                const forAwait : Promise<any>[]  = []

                counter++

                if (connectedPort) {
                    const disconnect = async () => {
                        await this.dispatcher.cleanupQueue.clearAll()

                        await connectedPort.disconnect()
                        connectedPort       = undefined
                    }
                    forAwait.push(disconnect())
                }

                if (counter > 1) {
                    // TODO refactor `setupProjectData` to `retrieveProjectData` or something
                    // this mutable style is bad
                    this.projectData    = undefined

                    // this call takes time because launcher spans a new browser instance..
                    // should have one browser instance "spare" and span a page in it?
                    forAwait.push(this.setupProjectData(true))
                }

                try {
                    await Promise.all(forAwait)
                } catch (e) {
                    if (e instanceof LauncherError) {
                        this.onLauncherError(e)
                    } else {
                        this.onUnknownError(e)
                    }
                }

                if (counter > 1) {
                    this.dispatcher         = this.dispatcherClass.new({
                        launcher            : this,
                        contextProviders    : this.dispatcher.contextProviders
                    })
                }

                const port              = this.dashboardConnector = connectedPort = DashboardConnectorServer.new({ launcher : this })
                const media             = MediaNodeWebSocketParent.new({ onCloseDisconnectSilently : true })

                port.media              = media
                media.socket            = socket
                port.handshakeType      = 'parent_first'

                await port.connect()

                this.logger.debug('Launcher connected to dashboard')

                this.isClosingDashboard     = false

                await port.startDashboard(this.projectData, this.getDescriptor())

                this.logger.debug('Dashboard started')
            })

            const relPath           = path.relative('./', fileURLToPath(`${ siestaPackageRootUrl }resources/dashboard/index.html`))

            await page.goto(`http://localhost:${ webPort }/${ relPath }?port=${ wsPort }`)

            return donePromise
        }


        static async run () {
            process.on('unhandledRejection', (reason : any, promise) => {
                console.log('Unhandled promise rejection, reason:', reason?.stack || reason)

                process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })

            process.on('uncaughtException', (reason : any, promise) => {
                process.exitCode = ExitCodes.UNHANDLED_EXCEPTION
            })

            const launcher  = this.new({
                inputArguments      : process.argv.slice(2)
            })

            await launcher.start()

            await launcher.destroy()
        }
    }
) {}

