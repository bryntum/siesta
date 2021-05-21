import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { serializable } from "../../serializable/Serializable.js"
import { EnvironmentType } from "../common/Environment.js"
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
/**
 * Test descriptor class for tests running in the browser environment.
 */
@serializable({ id : 'TestDescriptorBrowser' })
export class TestDescriptorBrowser extends Mixin(
    [ TestDescriptor ],
    (base : ClassUnion<typeof TestDescriptor>) => {

    class TestDescriptorBrowser extends base {
        type                : EnvironmentType           = 'browser'

        @option()
        preload             : PreloadDescriptor[]       = []

        @option()
        alsoPreload         : PreloadDescriptor[]       = []

        @option()
        pageUrl             : string                    = ''
    }

    return TestDescriptorBrowser
}){}

