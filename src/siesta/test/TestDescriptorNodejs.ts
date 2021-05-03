import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { serializable } from "../../serializable/Serializable.js"
import { EnvironmentType } from "../common/Environment.js"
import { TestDescriptor } from "./TestDescriptor.js"

/**
 * IMPORTANT
 *
 * Even that this class describes the Node.js test descriptor,
 * it is assumed to be isomorphic itself,
 * see
 *      src/siesta/test/port/TestLauncher.tsx
 */


//---------------------------------------------------------------------------------------------------------------------
/**
 * Test descriptor class for tests running in the [Node.js](https://nodejs.org/) environment.
 */
@serializable()
export class TestDescriptorNodejs extends Mixin(
    [ TestDescriptor ],
    (base : ClassUnion<typeof TestDescriptor>) => {

    class TestDescriptorNodejs extends base {
        type            : EnvironmentType               = 'nodejs'
    }

    return TestDescriptorNodejs
}){}

