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
@serializable()
export class TestDescriptorDeno extends Mixin(
    [ TestDescriptor ],
    (base : ClassUnion<typeof TestDescriptor>) => {

    class TestDescriptorDeno extends base {
        type            : EnvironmentType               = 'deno'
    }

    return TestDescriptorDeno
}){}
