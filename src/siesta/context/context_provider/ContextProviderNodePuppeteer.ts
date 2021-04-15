import puppeteer from "puppeteer"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { LauncherNodejs } from "../../launcher/LauncherNodejs.js"
import { ContextPuppeteer } from "../ContextPuppeteer.js"
import { ContextProviderTargetBrowser } from "./ContextProviderTargetBrowser.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderNodePuppeteer extends Mixin(
    [ ContextProviderTargetBrowser ],
    (base : ClassUnion<typeof ContextProviderTargetBrowser>) => {

    class ContextProviderNodePuppeteer extends base {
        local                   : boolean           = true
        supportsBrowser         : boolean           = true
        supportsNodejs          : boolean           = false

        contextClass            : typeof ContextPuppeteer   = ContextPuppeteer

        launcher                : LauncherNodejs            = undefined

        // `true` is a bit slower, seems more robust though
        separateBrowserForEveryPage : boolean       = true


        $primaryBrowser     : puppeteer.Browser     = undefined

        async getPrimaryBrowser () : Promise<puppeteer.Browser> {
            if (this.$primaryBrowser !== undefined) return this.$primaryBrowser

            return this.$primaryBrowser = await this.createBrowser()
        }


        async destroy () {
            await super.destroy()

            if (this.$primaryBrowser) await this.$primaryBrowser.close()
        }


        async doCreateContext () : Promise<InstanceType<this[ 'contextClass' ]>> {
            const browser           = this.separateBrowserForEveryPage ? await this.createBrowser() : await this.getPrimaryBrowser()

            const page              = await browser.newPage()

            // TODO route the console messages to logger
            // page.on('console', msg => {
            //   for (let i = 0; i < msg.args().length; ++i)
            //     console.log(`${ i }: ${ msg.args()[ i ] }`)
            // })

            return this.contextClass.new({ page, maintainsBrowser : this.separateBrowserForEveryPage }) as InstanceType<this[ 'contextClass' ]>
        }


        async createBrowser () : Promise<puppeteer.Browser> {
            const args      = [
                '--window-size=1280,1024',
                // prepend `--` if missing
                ...this.launcher.browserArg.map(arg => arg.replace(/^(--)?/, '--'))
            ]

            return await puppeteer.launch({
                args,
                headless                : this.launcher.headless,
                ignoreHTTPSErrors       : true,
                devtools                : !this.launcher.headless,
                // TODO should enable `slowMo` for non-headless?
                // at least provide an option to enable it
                // slowMo                  : 250,
                timeout                 : 60000
            })
        }
    }

    return ContextProviderNodePuppeteer
}) {}
