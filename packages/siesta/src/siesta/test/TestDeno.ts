// @ts-ignore
import * as path from "https://deno.land/std@0.94.0/path/mod.ts"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ExecutionContextDeno } from "../../context/ExecutionContextDeno.js"
import { prototypeValue } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { createTestSectionConstructors, Test } from "./Test.js"
import { TestBrowser } from "./TestBrowser.js"
import { TestDescriptorDeno } from "./TestDescriptorDeno.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
declare const Deno


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the [Deno](https://deno.land/) environment.
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

        // @prototypeValue(ExecutionContextNode)
        // executionContextClass   : typeof ExecutionContext


        static getSelfUrl () : string {
            const testUrl       = path.fromFileUrl(Deno.mainModule)

            return path.relative(path.resolve(), testUrl)
        }


        static getInputArguments () : string[] {
            return Deno.args
        }


        static async getIsomorphicTestClass () : Promise<typeof Test> {
            return this
        }


        static async getExecutionContextClass () : Promise<typeof ExecutionContext> {
            return ExecutionContextDeno
        }


        static async getLauncherClass () : Promise<typeof Launcher> {
            return (await import('../launcher/LauncherDeno.js')).LauncherDeno
        }
    }

) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const {
    /**
     * Alias for {@link TestDeno.it | it} method.
     */
    it,

    /**
     * Alias for {@link TestDeno.iit | iit} method.
     */
    iit,

    /**
     * Alias for {@link TestDeno.xit | xit} method.
     */
    xit,

    /**
     * Alias for {@link TestDeno.describe | describe} method.
     */
    describe,

    /**
     * Alias for {@link TestDeno.ddescribe | ddescribe} method.
     */
    ddescribe,

    /**
     * Alias for {@link TestDeno.xdescribe | xdescribe} method.
     */
    xdescribe
} = createTestSectionConstructors(TestDeno)
