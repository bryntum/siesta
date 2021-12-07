import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { prototypeValue } from "../../util/Helpers.js"
import { ActionTarget } from "../simulate/Types.js"
import { createTestSectionConstructors } from "../test/Test.js"
import { TestBrowser } from "../test/TestBrowser.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test class for code running in the browser environment.
 */
export class TestSencha extends Mixin(
    [
        TestBrowser
    ],
    (base : ClassUnion<
        typeof TestBrowser
    >) =>

    class TestSencha extends base {
        @prototypeValue(TestDescriptorSencha)
        testDescriptorClass     : typeof TestDescriptorSencha

        descriptor              : TestDescriptorSencha


        // addListenerToObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
        //     observable.addEventListener(event, listener)
        // }
        //
        //
        // removeListenerFromObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
        //     observable.removeEventListener(event, listener)
        // }
        //
        //
        // resolveObservable (source : ActionTarget) : Element {
        //     return this.resolveActionTarget(source)
        // }
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
