import path from "path"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextNode } from "../../context/ExecutionContextNode.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorNodejs } from "./TestDescriptorNodejs.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Test class for code running in the [Node.js](https://nodejs.org/) environment.
 */
export class TestNodejs extends Mixin(
    [
        Test
    ],
    (base : ClassUnion<
        typeof Test
    >) => {

    class TestNodejs extends base {
        @prototypeValue(TestDescriptorNodejs)
        testDescriptorClass     : typeof TestDescriptorNodejs

        // @prototypeValue(ExecutionContextNode)
        // executionContextClass   : typeof ExecutionContext


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


        static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
            return ExecutionContextNode
        }


        static async getLauncherClass () : Promise<typeof Launcher> {
            return (await import('../launcher/LauncherNodejs.js')).LauncherNodejs
        }
    }

    return TestNodejs

}) {}


//---------------------------------------------------------------------------------------------------------------------
export const { it, iit, xit, describe, ddescribe, xdescribe } = createTestSectionConstructors(TestNodejs)
