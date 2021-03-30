import { serializable } from "../../serializable/Serializable.js"
import { option } from "../option/Option.js"
import { TestDescriptor } from "./TestDescriptor.js"

/**
 * IMPORTANT
 *
 * this class is assumed to be isomorphic right now,
 * see
 *      src/siesta/test/port/TestLauncher.tsx
 */

//---------------------------------------------------------------------------------------------------------------------
export type PreloadDescriptor = string
    | { type? : 'js' | 'css', url : string }
    | { code : string | Function }
    | { style : string }
    | PreloadDescriptor[]


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class TestDescriptorBrowser extends TestDescriptor {
    @option()
    preload             : PreloadDescriptor[]       = []

    @option()
    alsoPreload         : PreloadDescriptor[]       = []

    @option()
    pageUrl             : string                    = ''
}

