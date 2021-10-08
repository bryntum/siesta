import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { serializable } from "../../serializable/Serializable.js"
import { EnvironmentType } from "../common/Environment.js"
import { IsolationLevel, SimulationType } from "../common/IsolationLevel.js"
import { option } from "../option/Option.js"
import { PointerMovePrecision } from "../simulate/SimulatorMouse.js"
import { TestDescriptor } from "./TestDescriptor.js"

/**
 * IMPORTANT
 *
 * this class is assumed to be isomorphic right now,
 * see
 *      src/siesta/test/port/TestLauncher.tsx
 */

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type PreloadDescriptor =
    | string
    | { type? : 'js' | 'css', url : string }
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

        @option()
        simulation          : SimulationType            = 'native'

        @option()
        isolation           : IsolationLevel            = 'iframe'

        @option()
        preload             : PreloadDescriptor[]       = []

        @option()
        alsoPreload         : PreloadDescriptor[]       = []

        @option()
        pageUrl             : string                    = ''

        viewportWidth       : number                    = 1024
        viewportHeight      : number                    = 768

        mouseMovePrecision  : PointerMovePrecision      = { kind : 'last_only', precision : 1 }

        // TODO rename or may be even replace with more generic option
        // like `cssReset` which will accept a CSS text
        expandBody          : boolean                   = true


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

