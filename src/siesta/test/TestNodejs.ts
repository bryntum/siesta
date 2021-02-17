import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { prototypeValue } from "../../util/Helpers.js"
import { LauncherNodejs } from "../launcher/LauncherNodejs.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorNodejs } from "./TestDescriptorNodejs.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestNodejs extends Mixin(
    [
        Test
    ],
    (base : ClassUnion<
        typeof Test
    >) => {

    class TestNodejs extends base {
        @prototypeValue(LauncherNodejs)
        launcherClass           : typeof LauncherNodejs

        @prototypeValue(TestDescriptorNodejs)
        testDescriptorClass     : typeof TestDescriptorNodejs


        static getSelfUrl () : string {
            return process.argv[ 1 ]
        }

        static getInputArguments () : string[] {
            return process.argv.slice(2)
        }
    }

    return TestNodejs

}) {}


//---------------------------------------------------------------------------------------------------------------------
export const { it, iit, xit, describe, ddescribe, xdescribe } = createTestSectionConstructors(TestNodejs)

export { afterEach, beforeEach, expect } from "./Test.js"
