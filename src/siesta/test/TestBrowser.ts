import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { prototypeValue } from "../../util/Helpers.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorBrowser } from "./TestDescriptorBrowser.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestBrowser extends Mixin(
    [
        Test
    ],
    (base : ClassUnion<
        typeof Test
    >) => {

    class TestBrowser extends base {
        @prototypeValue(LauncherBrowser)
        launcherClass           : typeof LauncherBrowser

        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass     : typeof TestDescriptorBrowser
    }

    return TestBrowser

}) {}


//---------------------------------------------------------------------------------------------------------------------
export const { it, iit, xit, describe, ddescribe, xdescribe } = createTestSectionConstructors(TestBrowser)

export { afterEach, beforeEach, expect } from "./Test.js"
