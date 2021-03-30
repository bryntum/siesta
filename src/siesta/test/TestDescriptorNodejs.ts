import { serializable } from "../../serializable/Serializable.js"
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
export class TestDescriptorNodejs extends TestDescriptor {
}

