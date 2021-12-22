import playwright, { LaunchOptions } from "playwright"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { browserType } from "../../../util_browser/PlaywrightHelpers.js"
import { LauncherNodejs } from "../../launcher/LauncherNodejs.js"
import { TestDescriptor } from "../../test/TestDescriptor.js"
import { ContextPlaywright } from "../ContextPlaywright.js"
import { ContextProviderTargetBrowser } from "./ContextProviderTargetBrowser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ContextProviderNodePlaywright extends Mixin(
    [ ContextProviderTargetBrowser ],
    (base : ClassUnion<typeof ContextProviderTargetBrowser>) =>

    class ContextProviderNodePlaywright extends base {
        supportsBrowser         : boolean           = true
        supportsNodejs          : boolean           = false

        contextClass            : typeof ContextPlaywright   = ContextPlaywright

        launcher                : LauncherNodejs    = undefined

        // `true` is noticeable slower, seems more robust though
        separateBrowserForEveryPage : boolean       = false


        $primaryBrowser     : playwright.Browser     = undefined

        async getPrimaryBrowser () : Promise<playwright.Browser> {
            if (this.$primaryBrowser !== undefined) return this.$primaryBrowser

            return this.$primaryBrowser = await this.createBrowser()
        }


        $primaryBrowserContext     : playwright.BrowserContext      = undefined

        async getPrimaryBrowserContext () : Promise<playwright.BrowserContext> {
            if (this.$primaryBrowserContext !== undefined) return this.$primaryBrowserContext

            return this.$primaryBrowserContext = await (await this.getPrimaryBrowser()).newContext({ ignoreHTTPSErrors : true, bypassCSP : true })
        }


        async destroy () {
            await super.destroy()

            if (this.$primaryBrowser) await this.$primaryBrowser.close()
        }


        async doCreateContext (desc? : TestDescriptor) : Promise<InstanceType<this[ 'contextClass' ]>> {
            // this.launcher.logger.debug('Context requested')

            // a bit messy - the `browser` here is actually a `Browser | BrowserContext`
            const browser           = this.separateBrowserForEveryPage ? await this.createBrowser() : await this.getPrimaryBrowserContext()

            // this.launcher.logger.debug('Context has browser')

            const page              = await browser.newPage({ ignoreHTTPSErrors : true, bypassCSP : true })

            // this.launcher.logger.debug('Context has page')

            // TODO route the console messages to logger
            // page.on('console', msg => {
            //   for (let i = 0; i < msg.args().length; ++i)
            //     console.log(`${ i }: ${ msg.args()[ i ] }`)
            // })

            return this.contextClass.new({ page, maintainsBrowser : this.separateBrowserForEveryPage }) as InstanceType<this[ 'contextClass' ]>
        }


        get browserType () : playwright.BrowserType<any> {
            return browserType(this.launcher.browser)
        }


        async createBrowser () : Promise<playwright.Browser> {
            const launcher      = this.launcher

            const args      = [
                // '--window-size=1280,1024',
                // prepend `--` if missing
                ...this.launcher.browserArg.map(arg => arg.replace(/^(--)?/, '--'))
            ]

            const launchOptions : LaunchOptions = {
                args,
                headless                : launcher.headless,
                // TODO should enable `slowMo` for non-headless?
                // at least provide an option to enable it
                // slowMo                  : 250,
                timeout                 : 60000
            }

            if (launcher.browser === 'chrome') {
                launchOptions.devtools  = !launcher.headless
            }

            Object.assign(
                launchOptions,
                launcher.browserLaunchOptions,
                launcher.browserBinary ? { executablePath : launcher.browserBinary } : null
            )

            return await this.browserType.launch(launchOptions)
        }

        static providerName : string = 'playwright'
    }
) {}
