import path from "path"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextNode } from "../../context/ExecutionContextNode.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDeno } from "./TestDeno.js"
import { TestDescriptorNodejs } from "./TestDescriptorNodejs.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the [Node.js](https://nodejs.org/) environment.
 */
export class TestNodejs extends Mixin(
    [
        Test
    ],
    (base : ClassUnion<
        typeof Test
    >) =>

    class TestNodejs extends base {
        @prototypeValue(TestDescriptorNodejs)
        testDescriptorClass     : typeof TestDescriptorNodejs


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

) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const {
    /**
     * Alias for {@link TestNodejs.it | it} method.
     */
    it,

    /**
     * Alias for {@link TestNodejs.iit | iit} method.
     */
    iit,

    /**
     * Alias for {@link TestNodejs.xit | xit} method.
     */
    xit,

    /**
     * Alias for {@link TestNodejs.describe | describe} method.
     */
    describe,

    /**
     * Alias for {@link TestNodejs.ddescribe | ddescribe} method.
     */
    ddescribe,

    /**
     * Alias for {@link TestNodejs.xdescribe | xdescribe} method.
     */
    xdescribe
} = createTestSectionConstructors(TestNodejs)
