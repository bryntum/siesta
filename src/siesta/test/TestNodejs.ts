import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { LauncherNodejs } from "../launcher/LauncherNodejs.js"
import { Test } from "./Test.js"
import { TestDescriptor, TestDescriptorArgument } from "./TestDescriptor.js"
import { TestDescriptorNodejs } from "./TestDescriptorNodejs.js"


export { afterEach, beforeEach, expect } from "./Test.js"


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
        launcherClass           : typeof Launcher

        @prototypeValue(TestDescriptorNodejs)
        testDescriptorClass : typeof TestDescriptor


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
export const it = (name : TestDescriptorArgument, code : (t : TestNodejs) => any) : TestNodejs => {
    return TestNodejs.it(name, code)
}

export const describe = it


export const iit = (name : TestDescriptorArgument, code : (t : TestNodejs) => any) : TestNodejs => {
    return TestNodejs.iit(name, code)
}

export const ddescribe = iit


export const xit = (name : TestDescriptorArgument, code : (t : TestNodejs) => any) : TestNodejs => {
    return TestNodejs.new()
}

export const xdescribe = xit


