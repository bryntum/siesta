import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { serializable } from "../../serializable/Serializable.js"
import { EnvironmentType } from "../common/Environment.js"
import { TestDescriptor } from "./TestDescriptor.js"

/*
IMPORTANT

this class is assumed to be isomorphic right now,
see
    src/siesta/test/port/TestLauncher.tsx
*/


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test descriptor class for tests running in the [Deno](https://deno.land/) environment.
 */
@serializable({ id : 'TestDescriptorDeno' })
export class TestDescriptorDeno extends Mixin(
    [ TestDescriptor ],
    (base : ClassUnion<typeof TestDescriptor>) =>

    class TestDescriptorDeno extends base {
        type            : EnvironmentType               = 'deno'


        // TODO refactor this, see comment for TestDescriptorBrowser
        isRunningInDashboard () : boolean {
            return false
        }
    }
){}

