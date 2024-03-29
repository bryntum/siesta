import { promises as fsPromises } from 'fs'
import { buildYargs } from "c8/lib/parse-args.js"
import istanbulLibReport from 'istanbul-lib-report'
import istanbulReports from 'istanbul-reports'
import C8Report from "c8/lib/report.js"
import foreground from "foreground-child"
import { startDevServer } from "@web/dev-server"
import { randomBytes } from "crypto"
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
import { isArray, isString } from "../../util/Typeguards.js"
import { browserType } from "../../util_browser/PlaywrightHelpers.js"
import { EnvironmentType } from "../common/Environment.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderDashboardIframe } from "../context/context_provider/ContextProviderDashboardIframe.js"
import { ContextProviderNodeChildProcess } from "../context/context_provider/ContextProviderNodeChildProcess.js"
import { ContextProviderNodePlaywright } from "../context/context_provider/ContextProviderNodePlaywright.js"
import { V8CodeCoverageInfo } from "../context/ContextPlaywright.js"
import { camelCaseToSnakeCase } from "../option/Option.js"
import { ProjectDescriptorNodejs } from "../project/ProjectDescriptor.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ReporterNodejsTerminal } from "../reporter/ReporterNodejsTerminal.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeNodejs } from "../runtime/RuntimeNodejs.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { DashboardConnectorServer } from "./DashboardConnector.js"
import { Dispatcher } from "./Dispatcher.js"
import { DispatcherNodejs } from "./DispatcherNodejs.js"
import { Launcher } from "./Launcher.js"
import { LauncherDescriptorNodejs } from "./LauncherDescriptorNodejs.js"
import { LauncherError, LauncherRestartOnCodeCoverage } from "./LauncherError.js"
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


        override async finalize () {
            await super.finalize()

            if (this.coverageReporter) {
                if (this.getEnvironmentByUrl(this.project) === 'browser') {
                    const c8Report      = C8Report(Object.assign(
                        this.coverageYargsAsObject, { allowExternal : true }
                    ))

                    c8Report._getSourceMap = function (v8ScriptCov) {
                        return { source : v8ScriptCov.source }
                    }

                    const launcher      = this

                    c8Report.run = async function () {
                        const context = istanbulLibReport.createContext({
                            sourceFinder    : (url : string) => launcher.getSourcesOfCoverageFile(url),
                            dir             : this.reportsDirectory,
                            watermarks      : this.watermarks,
                            coverageMap     : await this.getCoverageMapFromAllCoverageFiles()
                        })

                        for (const reporter of this.reporter) {
                            istanbulReports.create(reporter, {
                                skipEmpty   : false,
                                skipFull    : this.skipFull,
                                maxCols     : 100
                            }).execute(context)
                        }
                    }

                    await c8Report.run()
                }
            }
        }


        async onLauncherOptionsAvailable () {
            await super.onLauncherOptionsAvailable()

            await this.setupCodeCoverage()

            if (this.noColor || !process.stdout.isTTY) {
                this.colorerClass       = ColorerNoop
                this.reporterClass      = ReporterNodejs
            }
        }


        async prepareCoverageReportDirs () {
            const coverageYargs      = this.coverageYargs

            // TODO cleanup when dropping support for Node 12
            // use newer `rm` (Node 14.xx) if available, the `recursive` option for `rmdir` is deprecated
            if (fsPromises.rm)
                await fsPromises.rm(coverageYargs.tempDirectory, { recursive : true, force : true })
            else
                await fsPromises.rmdir(coverageYargs.tempDirectory, { recursive : true })

            await fsPromises.mkdir(coverageYargs.tempDirectory, { recursive : true })
        }


        get coverageYargsAsObject () : object {
            const argv      = this.coverageYargs

            return {
                include             : argv.include,
                exclude             : argv.exclude,
                excludeAfterRemap   : argv.excludeAfterRemap,
                reporter            : Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
                reportsDirectory    : argv['reports-dir'],
                tempDirectory       : argv.tempDirectory,
                watermarks          : argv.watermarks,
                resolve             : argv.resolve,
                omitRelative        : argv.omitRelative,
                wrapperLength       : argv.wrapperLength,
                all                 : argv.all,
                allowExternal       : argv.allowExternal,
                src                 : argv.src,
                skipFull            : argv.skipFull,
                excludeNodeModules  : argv.excludeNodeModules
            }
        }


        async setupCodeCoverage () {
            // coverage is enabled
            if (this.coverageReporter) {
                // for Node.js launch
                if (this.getEnvironmentByUrl(this.project) === 'nodejs') {
                    // and this is the "original" launch, not the secondary "foreground" launch
                    // with the `NODE_V8_COVERAGE` enabled
                    if (!this.isForeground) {
                        const coverageYargs      = this.coverageYargs

                        await this.prepareCoverageReportDirs()

                        process.env.NODE_V8_COVERAGE = coverageYargs.tempDirectory

                        foreground(process.argv.concat('--is-foreground'), async (done) => {
                            const c8Report      = C8Report(this.coverageYargsAsObject)
                            await c8Report.run()
                            done()
                        })

                        // const args = process.argv.slice()
                        // args.splice(1, 0, '--inspect-brk')
                        // args.push('--is-foreground')
                        // foreground(args, async (done) => {
                        //     const c8Report      = C8Report(Object.assign({}, this.coverageYargs, { reporter : this.coverageReporter }))
                        //     await c8Report.run()
                        //     done()
                        // })

                        throw new LauncherRestartOnCodeCoverage()
                    }
                }
                // for browser launch
                else {
                    await this.prepareCoverageReportDirs()
                }
            }
        }


        $coverageYargs          = undefined

        get coverageYargs () {
            if (this.$coverageYargs !== undefined) return this.$coverageYargs

            const args = [
                'coverageReporter', 'coverageReportDir', 'coverageSrc',
                'coverageInclude', 'coverageExclude', 'coverageClean', 'coverageAll'
            ].flatMap(name => {
                const value     = this[ name ]
                const c8Name    = camelCaseToSnakeCase(name.replace(/^coverage/, '').replace(/^./, char => char.toLowerCase()), '-')

                if (value === undefined) return []

                return isArray(value) ? value.flatMap(oneValue => [ `--${ c8Name }`, oneValue ]) : [ `--${ c8Name }`, value ]
            })

            // requires at least 1 positional argument
            args.push('dummy-script.js')

            return this.$coverageYargs = buildYargs().parse(args)
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
            process.on('unhandledRejection', (reason : any, promise) => {
                console.log('Unhandled promise rejection, reason:', reason?.stack || reason)

                process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })

            process.on('uncaughtException', (reason : any, promise) => {
                process.exitCode = ExitCodes.UNHANDLED_EXCEPTION
            })

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

            let webServer   : UnwrapPromise<ReturnType<typeof startDevServer>>
            let cwd         : string
            let webPort     : number

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
                    webServer?.stop() ?? Promise.resolve(),
                    connectedPort?.disconnect(true) ?? Promise.resolve()
                ])

                await wsServer.stopWebSocketServer()

                done()
            })

            // we only need a webserver for the terminal projects, for browser projects
            // we use the user webserver
            if (!isBrowserProject) {
                cwd                     = path.resolve('./')

                do {
                    let relPath         = path.relative(cwd, fileURLToPath(siestaPackageRootUrl))

                    if (!relPath.startsWith('../')) break

                    cwd                 = path.resolve(cwd, '..')
                } while (true)

                webServer               = await startDevServer({
                    config : {
                        rootDir     : cwd,
                        nodeResolve : true
                    },
                    readCliArgs         : false,
                    logStartMessage     : false
                })

                const address           = webServer.server.address()
                webPort                 = !isString(address) ? address.port : undefined

                if (webPort === undefined) throw new Error("Address should be available")

                this.write(<div>
                    <p>Dashboard web server launched</p>
                    <p class="indented">Root dir : <span class="accented">{ process.cwd() }</span></p>
                    <p class="indented">Address  : <span class="accented">http://localhost:{ webPort }</span></p>
                </div>)
            }

            const wsServer          = new ServerNodeWebSocket()
            const wsPort            = await wsServer.startWebSocketServer()

            let counter             = 0

            // this is the point where dashboard connects to the websocket server
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

                    // TODO this call takes time because launcher spans a new browser instance..
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

                this.isClosingDashboard = false

                await port.startDashboard(this.projectData, this.getDescriptor())

                this.logger.debug('Dashboard started')
            })

            if (isBrowserProject) {
                await page.goto(`${ this.projectData.siestaPackageRootUrl }resources/dashboard/index.html?port=${ wsPort }`)
            } else {
                const relPath           = path.relative(cwd, fileURLToPath(`${ siestaPackageRootUrl }resources/dashboard/index.html`))

                await page.goto(`http://localhost:${ webPort }/${ relPath }?port=${ wsPort }`)
            }

            return donePromise
        }


        sourcesOfCoverageFile : Map<string, string>     = new Map()

        getSourcesOfCoverageFile (url : string) : string {
            return this.sourcesOfCoverageFile.get(url) || this.sourcesOfCoverageFile.get('file://' + url) || `No sources available for: ${ url }`
        }


        async collectBrowserCoverageInfo (desc : TestDescriptor, rawInfo : V8CodeCoverageInfo[]) {
            rawInfo.forEach(el => {
                const url       = el.url = el.url
                    .replace(/^https?:\/\//, 'file:///').replace(/^file:\/\/\/([^/]+):(\d+)/, 'file:///$1/$2')

                // avoid constantly shuffling the memory with new values for sources
                if (!this.sourcesOfCoverageFile.has(url)) this.sourcesOfCoverageFile.set(url, el.source)
            })

            const info      = { result : rawInfo }

            await this.runtime.writeToFile(
                `${ this.coverageYargs.tempDirectory }/browser-cov-report-${ randomBytes(16).toString("hex") }.json`,
                JSON.stringify(info)
            )
        }


        static async run () {
            const launcher  = this.new({
                inputArguments      : process.argv.slice(2)
            })

            await launcher.start()
            await launcher.destroy()

            // launcher.exit()
        }
    }
) {}

