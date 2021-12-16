import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextNode } from "../../context/ExecutionContextNode.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorNodejs } from "./TestDescriptorNodejs.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the [Node.js](https://nodejs.org/) environment.
 *
 * Please refer to the [[TestDescriptorNodejs]] documentation for the list of available config options.
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


        static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
            return ExecutionContextNode
        }


        static async getLauncherClass () : Promise<typeof Launcher> {
            return (await import('../launcher/LauncherNodejs.js')).LauncherNodejs
        }
    }

) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const api = createTestSectionConstructors(TestNodejs)

/**
 * Alias for {@link TestNodejs.it | it} method.
 */
export const it = api.it

/**
 * Alias for {@link TestNodejs.iit | iit} method.
 */
export const iit = api.iit

/**
 * Alias for {@link TestNodejs.xit | xit} method.
 */
export const xit = api.xit

/**
 * Alias for {@link TestNodejs.describe | describe} method.
 */
export const describe = api.describe

/**
 * Alias for {@link TestNodejs.ddescribe | ddescribe} method.
 */
export const ddescribe = api.ddescribe

/**
 * Alias for {@link TestNodejs.xdescribe | xdescribe} method.
 */
export const xdescribe = api.xdescribe
