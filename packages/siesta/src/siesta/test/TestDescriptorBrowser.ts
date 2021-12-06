import { CI } from "chained-iterator/index.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { serializable } from "../../serializable/Serializable.js"
import { prototypeValue } from "../../util/Helpers.js"
import { EnvironmentType } from "../common/Environment.js"
import { IsolationLevel, SimulationType } from "../common/IsolationLevel.js"
import { option } from "../option/Option.js"
import { PointerMovePrecision } from "../simulate/SimulatorMouse.js"
import { config, TestDescriptor } from "./TestDescriptor.js"

/*
IMPORTANT

this class is assumed to be isomorphic right now,
see
    src/siesta/test/port/TestLauncher.tsx
*/

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type PreloadDescriptor =
    | 'inherit'
    | string
    | { type? : 'js' | 'css', url : string, isEcmaModule : boolean }
    | { type? : 'js' | 'css', content : string, isEcmaModule : boolean }
    | { text : string | Function }
    | { code : string | Function }
    | { style : string }
    | PreloadDescriptor[]


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test descriptor class for tests running in the browser environment.
 */
@serializable({ id : 'TestDescriptorBrowser' })
export class TestDescriptorBrowser extends Mixin(
    [ TestDescriptor ],
    (base : ClassUnion<typeof TestDescriptor>) =>

    class TestDescriptorBrowser extends base {
        type                : EnvironmentType           = 'browser'

        @config()
        // TODO should use only `prototypeValue`, currently w/o initializer things breaks
        // but this prevents inheritance
        // seems need to refactor the descriptor inheritance mechanism
        @prototypeValue('native')
        @option()
        simulation          : SimulationType            = 'native'

        @config()
        // TODO `isolation` is actually inherited from `TestDescriptor`, `@option` should be applied there
        // TODO see above
        @prototypeValue('iframe')
        @option()
        isolation           : IsolationLevel            = 'iframe'

        @config({
            reducer : (name : 'preload', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'preload' ] => {
                // @ts-ignore
                return inheritanceBlockedByPageUrl('preload', parentsAxis)
            }
        })
        preload             : PreloadDescriptor | PreloadDescriptor[]

        @config({
            reducer : (name : 'alsoPreload', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'alsoPreload' ] => {
                return CI(parentsAxis.flatMap(desc => desc.alsoPreload)).reversed().toArray()
            }
        })
        alsoPreload         : PreloadDescriptor | PreloadDescriptor[]

        @config()
        @prototypeValue('')
        pageUrl             : string

        @config()
        @prototypeValue(1024)
        viewportWidth       : number

        @config()
        @prototypeValue(768)
        viewportHeight      : number

        @config()
        @prototypeValue({ kind : 'last_only', precision : 1 })
        mouseMovePrecision  : PointerMovePrecision

        // TODO rename or may be even replace with more generic option
        // like `cssReset` which will accept a CSS text
        @config()
        @prototypeValue(true)
        expandBody          : boolean

        /**
         * What to do, if an [[ActionTarget]] query has been resolved into multiple elements:
         *
         * - `use_first` - silently use the 1st one in the results, usually its the 1st element matching the query
         * in the depth-first order of the DOM tree.
         * - `warn` - use the 1st element, and issue a warning
         * - `throw` - throw an exception
         */
        @config()
        onAmbiguousQuery        : 'use_first' | 'warn' | 'throw'   = 'warn'


        // TODO refactor: Probably need a separate data structure `TestLaunchInfo`
        // which will contain the information about how exactly this descriptor is launched
        // for example an isomorphic descriptor can be launched with Node.js context provider
        // or browser
        // browser descriptor can be launched inside of the dashboard or on separate page
        // etc, may be some other info
        isRunningInDashboard () : boolean {
            return this.isolation === 'iframe' || this.isolation === 'context'
        }
    }
){}


function inheritanceBlockedByPageUrl (configName : keyof TestDescriptorBrowser, parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ typeof configName ] {
    let pageUrlConfigFound  = false
    let isInheriting        = false

    for (let i = 0; i < parentsAxis.length; i++) {
        const isProjectNode = i === parentsAxis.length - 1

        const descriptor    = parentsAxis[ i ]

        pageUrlConfigFound  = pageUrlConfigFound || descriptor.hasOwnProperty('pageUrl')

        if (descriptor.hasOwnProperty(configName) || isProjectNode) {
            let value       = descriptor[ configName ]

            if (value == 'inherit')
                isInheriting = true
            else
                return value
        }

        if (pageUrlConfigFound && !isInheriting) return undefined
    }

    return undefined
}
