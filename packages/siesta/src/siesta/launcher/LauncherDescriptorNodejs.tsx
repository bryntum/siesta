import { serializable } from "typescript-serializable-mixin"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { option, OptionGroup } from "../option/Option.js"
import { LauncherDescriptor, OptionsGroupPrimary } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export const OptionsGroupBrowser  = OptionGroup.new({
    name        : 'browser',
    title       : 'Browser',
    weight      : 900
})


export type SupportedBrowsers   = 'chrome' | 'firefox' | 'edge' | 'safari'


//---------------------------------------------------------------------------------------------------------------------
@serializable({ id : 'LauncherDescriptorNodejs' })
export class LauncherDescriptorNodejs extends Mixin(
    [ LauncherDescriptor ],
    (base : ClassUnion<typeof LauncherDescriptor>) =>

    class LauncherDescriptorNodejs extends base {

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
            enumeration : [ 'nodejs', 'deno', 'playwright' ],
            group       : OptionsGroupPrimary,
            help        : <div>
                The context provider to use to launch the tests. By default its `nodejs` for the Node.js test suites,
                `deno` for Deno test suites, and `playwright` for browser.
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
        browser        : SupportedBrowsers      = 'chrome'


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupBrowser,
            help        : <div>
                The command-line arguments to be passed to the browser process being launched.
            </div>
        })
        browserArg      : string[]              = []
    }
) {}
