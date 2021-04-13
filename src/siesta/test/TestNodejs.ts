import path from "path"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextNode } from "../../context/ExecutionContextNode.js"
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

        @prototypeValue(ExecutionContextNode)
        executionContextClass   : typeof ExecutionContext


        static getSelfUrl () : string {
            const testUrl       = process.argv[ 1 ]

            return path.relative(path.resolve(), testUrl)
        }


        static getInputArguments () : string[] {
            return process.argv.slice(2)
        }


        static async getIsomorphicTestClass () : Promise<typeof Test> {
            return this
        }
    }

    return TestNodejs

}) {}


//---------------------------------------------------------------------------------------------------------------------
export const { it, iit, xit, describe, ddescribe, xdescribe } = createTestSectionConstructors(TestNodejs)
