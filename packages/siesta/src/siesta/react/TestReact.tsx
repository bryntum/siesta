import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { prototypeValue } from "../../util/Helpers.js"
import { ActionTarget } from "../simulate/Types.js"
import { createTestSectionConstructors } from "../test/Test.js"
import { TestBrowser } from "../test/TestBrowser.js"
import { TestDescriptorReact } from "./TestDescriptorReact.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the browser environment.
 */
export class TestReact extends Mixin(
    [
        TestBrowser
    ],
    (base : ClassUnion<
        typeof TestBrowser
    >) =>

    class TestReact extends base {
        @prototypeValue(TestDescriptorReact)
        testDescriptorClass     : typeof TestDescriptorReact

        descriptor              : TestDescriptorReact
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const api = createTestSectionConstructors(TestReact)

/**
 * Alias for {@link TestReact.it | it} method.
 */
export const it = api.it

/**
 * Alias for {@link TestReact.iit | iit} method.
 */
export const iit = api.iit

/**
 * Alias for {@link TestReact.xit | xit} method.
 */
export const xit = api.xit

/**
 * Alias for {@link TestReact.describe | describe} method.
 */
export const describe = api.describe

/**
 * Alias for {@link TestReact.ddescribe | ddescribe} method.
 */
export const ddescribe = api.ddescribe

/**
 * Alias for {@link TestReact.xdescribe | xdescribe} method.
 */
export const xdescribe = api.xdescribe
