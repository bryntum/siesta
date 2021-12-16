import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextDeno } from "../../context/ExecutionContextDeno.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestDescriptorDeno } from "./TestDescriptorDeno.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
declare const Deno


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the [Deno](https://deno.land/) environment.
 *
 * Please refer to the [[TestDescriptorDeno]] documentation for the list of available config options.
 */
export class TestDeno extends Mixin(
    [
        Test
    ],
    (base : ClassUnion<
        typeof Test
    >) =>

    class TestDeno extends base {
        @prototypeValue(TestDescriptorDeno)
        testDescriptorClass     : typeof TestDescriptorDeno


        static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
            return ExecutionContextDeno
        }


        static async getLauncherClass () : Promise<typeof Launcher> {
            return (await import('../launcher/LauncherDeno.js')).LauncherDeno
        }
    }

) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const api = createTestSectionConstructors(TestDeno)

/**
 * Alias for {@link TestDeno.it | it} method.
 */
export const it = api.it

/**
 * Alias for {@link TestDeno.iit | iit} method.
 */
export const iit = api.iit

/**
 * Alias for {@link TestDeno.xit | xit} method.
 */
export const xit = api.xit

/**
 * Alias for {@link TestDeno.describe | describe} method.
 */
export const describe = api.describe

/**
 * Alias for {@link TestDeno.ddescribe | ddescribe} method.
 */
export const ddescribe = api.ddescribe

/**
 * Alias for {@link TestDeno.xdescribe | xdescribe} method.
 */
export const xdescribe = api.xdescribe
