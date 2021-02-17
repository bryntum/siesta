import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { LauncherBrowser } from "../launcher/LauncherBrowser.js"
import { Test } from "./Test.js"
import { TestDescriptor } from "./TestDescriptor.js"
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
        launcherClass           : typeof Launcher

        @prototypeValue(TestDescriptorBrowser)
        testDescriptorClass : typeof TestDescriptor
    }

    return TestBrowser

}) {}

