import playwright from "playwright"
import { serializable } from "typescript-serializable-mixin"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { option, OptionGroup } from "../option/Option.js"
import { LauncherDescriptor } from "./Launcher.js"
import { LauncherDescriptorTerminal } from "./LauncherTerminal.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const OptionsGroupBrowser  = OptionGroup.new({
    name        : 'browser',
    title       : 'Browser-related',
    weight      : 700
})


export const OptionsGroupCodeCoverage  = OptionGroup.new({
    name        : 'code_coverage',
    title       : 'Code coverage',
    weight      : 800
})

export type SupportedBrowsers   = 'chrome' | 'firefox' | 'edge' | 'safari'


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'LauncherDescriptorNodejs' })
export class LauncherDescriptorNodejs extends Mixin(
    [ LauncherDescriptor, LauncherDescriptorTerminal ],
    (base : ClassUnion<typeof LauncherDescriptor, typeof LauncherDescriptorTerminal>) =>

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


        // @option({
        //     type        : 'enum',
        //     enumeration : [ 'nodejs', 'deno', 'playwright' ],
        //     group       : OptionsGroupPrimary,
        //     help        : <div>
        //         The context provider to use to launch the tests. By default its `nodejs` for the Node.js test suites,
        //         `deno` for Deno test suites, and `playwright` for browser.
        //     </div>
        // })
        // provider        : string                = undefined


        @option({
            type        : 'enum',
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


        @option({
            type        : 'string',
            group       : OptionsGroupBrowser,
            help        : <div>
                The path to the browser executable. To use system installed Chrome provide it as:{'\n'}
                {'    '}--browser-binary="$(which google-chrome)"
            </div>
        })
        browserBinary       : string            = undefined


        @option({
            type        : 'json',
            group       : OptionsGroupBrowser,
            help        : <div>
                A string with the JSON object (you probably will need to quote it in console), containing
                the launch options for the browser. Don't forget to quote the object keys.

                See the https://playwright.dev/docs/api/class-browsertype#browser-type-launch for available options.
            </div>
        })
        browserLaunchOptions    : playwright.LaunchOptions      = undefined


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupCodeCoverage,
            help        : <div>
                Providing a value for this option will enable the code coverage information collection for this launch.
                The value of this option should be any valid Istanbul reporter, like `html` or `text`, full list
                available here: https://git.io/vHysA

                This option can be provided several times, resulting in several reports being generated.

                See the "Code coverage guide" for mode details.
            </div>
        })
        coverageReporter        : string[]          = undefined


        @option({
            type        : 'string',
            group       : OptionsGroupCodeCoverage,
            defaultValue : () => 'coverage',
            help        : <div>
            </div>
        })
        coverageReportDir       : string


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupCodeCoverage,
            help        : <div>
            </div>
        })
        coverageSrc             : string[]          = undefined


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupCodeCoverage,
            help        : <div>
            </div>
        })
        coverageInclude         : string[]          = undefined


        @option({
            type        : 'string',
            structure   : 'array',
            group       : OptionsGroupCodeCoverage,
            help        : <div>
            </div>
        })
        coverageExclude         : string[]          = undefined


        @option({
            type        : 'boolean',
            group       : OptionsGroupCodeCoverage,
            help        : <div>
            </div>
        })
        coverageClean           : boolean           = undefined


        @option({
            type        : 'boolean',
            group       : OptionsGroupCodeCoverage,
            help        : <div>
            </div>
        })
        coverageAll             : boolean           = undefined


        @option({
            type        : 'boolean',
            group       : OptionsGroupCodeCoverage,
            hideInHelp  : true
        })
        isForeground            : boolean           = undefined
    }
) {}
