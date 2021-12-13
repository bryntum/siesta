import { ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../jsx/TextJSX.js"
import { createTestSectionConstructors } from "../test/Test.js"
import { AssertionComponent } from "./assertion/AssertionComponent.js"
import { AssertionGrid } from "./assertion/AssertionGrid.js"
import { TestSenchaPre } from "./TestSenchaPre.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for testing code using Sencha framework.
 */
export class TestSencha extends Mixin(
    [
        AssertionComponent,
        AssertionGrid,
        TestSenchaPre
    ],
    (base : ClassUnion<
        typeof AssertionComponent,
        typeof AssertionGrid,
        typeof TestSenchaPre
    >) =>

    class TestSencha extends base {

    }
) {}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const api = createTestSectionConstructors(TestSencha)

/**
 * Alias for {@link TestSencha.it | it} method.
 */
export const it = api.it

/**
 * Alias for {@link TestSencha.iit | iit} method.
 */
export const iit = api.iit

/**
 * Alias for {@link TestSencha.xit | xit} method.
 */
export const xit = api.xit

/**
 * Alias for {@link TestSencha.describe | describe} method.
 */
export const describe = api.describe

/**
 * Alias for {@link TestSencha.ddescribe | ddescribe} method.
 */
export const ddescribe = api.ddescribe

/**
 * Alias for {@link TestSencha.xdescribe | xdescribe} method.
 */
export const xdescribe = api.xdescribe
