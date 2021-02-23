import { serializable } from "../../serializable/Serializable.js"
import { TestDescriptor } from "./TestDescriptor.js"

/**
 * IMPORTANT
 *
 * this class is assumed to be isomorphic right now,
 * see
 *      src/siesta/test/port/TestLauncher.tsx
 */


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class TestDescriptorNodejs extends TestDescriptor {
}

