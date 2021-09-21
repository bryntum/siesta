import { Base } from "../../class/Base.js"
import { AnyFunction } from "../../class/Mixin.js"
import { equalDeep } from "../../compare_deep/CompareDeepDiff.js"
import { Approximation, NumberApproximation } from "../../compare_deep/FuzzyMatcherDiff.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { isString } from "../../util/Typeguards.js"
import { ComparisonType, GotExpectTemplate, verifyExpectedNumber } from "./assertion/AssertionCompare.js"
import { Spy } from "./Spy.js"
import { Test } from "./Test.js"
import { Assertion } from "./TestResult.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
This class is the central point for writing assertions in the BDD style. Instances of this class can be generated with the
{@link Test.expect|expect} method or with the [["src/siesta/test/Test".expect|expect]] alias.

Then, a call of some method on the expectation instance will create a new assertion in the test.

To negate any assertion, you can use a special property [[not]], that contains another expectation instance with the opposite meaning.

For example:

```ts
t.expect(1).toBe(1)
t.expect(1).not.toBe(2)

t.expect('Foo').toContain('oo')
t.expect('Foo').not.toContain('bar')
```
*/
export class Expectation extends Base {

    value           : unknown           = undefined

    isNot           : boolean           = false

    t               : Test              = undefined

    /**
     * Returns expectation with the opposite meaning. For example:
     *
     * ```ts
     * t.expect(1).toBe(1)
     * t.expect(1).not.toBe(2)
     * ```
     */
    get not () : Expectation {
        const cls       = this.constructor as typeof Expectation

        return cls.new({ value : this.value, isNot : !this.isNot, t : this.t })
    }

    /**
     * This assertion compares the value provided to the {@link Test.expect|expect} method with the `expectedValue` argument.
     * Comparison is done with `===` operator, so it should be used **only with the primitives** - numbers, strings, booleans etc.
     * However, fuzzy matchers, generated with the [[any]] family of methods are supported.
     *
     * To deeply compare objects, arrays, and JSON in general, use {@link toEqual} method.
     *
     * This method works correctly with the fuzzy matchers generated with the {@link any} method
     *
     * @param expectedValue An expected value
     */
    toBe (expectedValue : unknown) {
        this.t.assertEqualityInternal(
            'expect(received).toBe(expected)',
            this.t.comparePrimitives(this.value, expectedValue),
            this.isNot,
            this.value,
            expectedValue
        )
    }


    /**
     * An alias for [[toEqual]]
     */
    toBeEqual (expectedValue : unknown) {
        this.t.assertStructuralEqualityInternal('expect(received).toBeEqual(expected)', this.isNot, this.value, expectedValue)
    }


    /**
     * This assertion compares the value provided to the {@link Test.expect|expect} method with the `expectedValue` argument.
     *
     * Comparison works for objects, arrays, and JSON in general. It is performed "deeply". Cyclic structures are properly handled.
     *
     * This method works correctly with the fuzzy matchers generated with the {@link any} method
     *
     * @param expectedValue An expected value
     */
    toEqual (expectedValue : unknown) {
        this.t.assertStructuralEqualityInternal('expect(received).toEqual(expected)', this.isNot, this.value, expectedValue)
    }


    /**
     * This assertion passes, when value provided to the {@link Test.expect|expect} method is `null`.
     */
    toBeNull () {
        this.t.assertEqualToConstant('expect(received).toBeNull()', this.value === null, this.isNot, this.value, null)
    }


    /**
     * This assertion passes, when value provided to the {@link Test.expect|expect} method is `NaN`.
     */
    toBeNaN () {
        this.t.assertEqualToConstant('expect(received).toBeNaN()', Number.isNaN(this.value), this.isNot, this.value, NaN)
    }


    /**
     * This assertion passes, when value provided to the {@link Test.expect|expect} method is not the `undefined` value.
     */
    toBeDefined () {
        this.t.assertDefinedInternal('expect(received).toBeDefined()', this.isNot, false, this.value)
    }


    /**
     * This assertion passes, when value provided to the {@link Test.expect|expect} method is the `undefined` value.
     */
    toBeUndefined () {
        this.t.assertDefinedInternal('expect(received).toBeUndefined()', this.isNot, true, this.value)
    }


    /**
     * This assertion passes, when value provided to the {@link Test.expect|expect} method is "truthy" - evaluates to `true`.
     * For example - non empty strings, numbers except the 0, objects, arrays etc.
     */
    toBeTruthy () {
        this.t.assertTrueInternal('expect(received).toBeTruthy()', this.isNot, false, this.value)
    }


    /**
     * This assertion passes, when value provided to the {@link Test.expect|expect} method is "falsy" - evaluates to `false`.
     * For example - empty strings, number 0, `null`, `undefined`, etc.
     */
    toBeFalsy () {
        this.t.assertTrueInternal('expect(received).toBeFalsy()', this.isNot, true, this.value)
    }


    /**
     * This assertion passes, when the string provided to the {@link Test.expect|expect} method matches the regular expression.
     *
     * @param regexp The regular expression to match the string against
     */
    toMatch (regexp : RegExp) {
        this.t.assertMatchInternal('expect(received).toMatch(expected)', this.isNot, this.value as string, regexp)
    }


    /**
     * This assertion passes in 2 cases:
     *
     * 1) When the value provided to the {@link Test.expect|expect} method is a string, and it contains a passed substring.
     * 2) When the value provided to the {@link Test.expect|expect} method is an array (or array-like), and it contains a passed element.
     *
     * @param element The element of the array or a sub-string
     */
    toContain (element : unknown) {
        const value       = this.value

        if (isString(value)) {
            this.t.assertMatchInternal('expect(received).toContain(expected)', this.isNot, value, element as string | RegExp)
        } else {
            this.t.assertIterableContainInternal('expect(received).toContain(expected)', this.isNot, value as Iterable<unknown>, element)
        }
    }


    /**
     * This assertion passes, when the number provided to the {@link Test.expect|expect} method is less than the
     * expected number.
     *
     * @param expectedValue The number to compare with
     */
    toBeLessThan (expectedValue : number) {
        this.t.assertCompareInternal('expect(received).toBeLessThan(expected)', false, ComparisonType.Less, this.value, expectedValue)
    }


    /**
     * This assertion passes, when the number provided to the {@link Test.expect|expect} method is less or equal than the
     * expected number.
     *
     * @param expectedValue The number to compare with
     */
    toBeLessOrEqualThan (expectedValue : number) {
        this.t.assertCompareInternal('expect(received).toBeLessOrEqualThan(expected)', false, ComparisonType.LessOrEqual, this.value, expectedValue)
    }


    /**
     * This assertion passes, when the number provided to the {@link Test.expect|expect} method is greater than the
     * expected number.
     *
     * @param expectedValue The number to compare with
     */
    toBeGreaterThan (expectedValue) {
        this.t.assertCompareInternal('expect(received).toBeGreaterThan(expected)', false, ComparisonType.Greater, this.value, expectedValue)
    }


    /**
     * This assertion passes, when the number provided to the {@link Test.expect|expect} method is greater or equal than the
     * expected number.
     *
     * @param expectedValue The number to compare with
     */
    toBeGreaterOrEqualThan (expectedValue) {
        this.t.assertCompareInternal('expect(received).toBeGreaterOrEqualThan(expected)', false, ComparisonType.GreaterOrEqual, this.value, expectedValue)
    }


    /**
     * This assertion passes, when the number provided to the {@link Test.expect|expect} method is approximately equal
     * the given number. The proximity can be defined as the `precision` argument
     *
     * @param expectedValue The number to compare with
     * @param approx The number approximation
     */
    toBeCloseTo (expectedValue : number, approx : Approximation = { digits : 2 }) {
        this.t.assertCompareApproxInternal(
            'expect(received).toBeCloseTo(expected)',
            this.isNot,
            this.value as number,
            expectedValue,
            NumberApproximation.fromApproximation(approx)
        )
    }


    /**
     * This assertion passes when the function provided to the {@link Test.expect|expect} method, throws an exception
     * during its execution.
     *
     * ```ts
     * t.expect(function(){
     *     throw "oopsie";
     * }).toThrow());
     * ```
     */
    async toThrow (pattern? : string | RegExp) {
        return this.t.assertThrowInternal('expect(func).toThrow()', this.isNot, this.value as AnyFunction, this.t.getSourcePoint(), pattern)
    }


    /**
     * This assertion passes, if a spy, provided to the {@link Test.expect|expect} method have been
     * called expected number of times. The expected number of times can be provided as the 1st argument and by default
     * is 1.
     *
     * One can also provide the function, spied on, to the {@link Test.expect|expect} method.
     *
     * Examples:
     * ```ts
     * const spy = t.spyOn(obj, 'process')
     *
     * // call the method 2 times
     * obj.process()
     * obj.process()
     *
     * // following 2 calls are equivalent
     * t.expect(spy).toHaveBeenCalled();
     * t.expect(obj.process).toHaveBeenCalled();
     *
     * // one can also use exact number of calls or comparison operators
     * t.expect(spy).toHaveBeenCalled(2);
     * t.expect(spy).toHaveBeenCalled('>1');
     * t.expect(spy).toHaveBeenCalled('<=3');
     * ```
     *
     * See also {@link toHaveBeenCalledWith}
     *
     * @param expectedNumber Expected number of calls. Can be either a number, specifying the exact
     * number of calls, or a string. In the latter case one should include a comparison operator in front of the number.
     *
     */
    toHaveBeenCalled (expectedNumber : number | string = '>=1') {
        // @ts-ignore
        const spy           = this.value?.__SIESTA_SPY__ ?? this.value

        if (!(spy instanceof Spy)) throw new Error("This method can be called on spy instance or spy wrapper function")

        const condition     = verifyExpectedNumber(spy.callsLog.length, expectedNumber)
        const passed        = this.isNot ? !condition : condition

        const name          = 'expect(spy).toHaveBeenCalled(expected)'

        this.t.addResult(Assertion.new({
            name            : this.isNot ? this.t.negateExpectationName(name) : name,
            passed,

            annotation      : passed ? undefined : GotExpectTemplate.el({
                gotTitle    : 'Actual number of calls',
                got         : spy.callsLog.length,

                expectTitle : 'Expected number of calls',
                expect      : expectedNumber
            })
        }))
    }


    /**
     * This assertion passes, if a spy, provided to the {@link Test.expect|expect} method have been
     * called at least once with the specified arguments.
     *
     * One can also provide the function, spied on, to the {@link Test.expect|expect} method.
     *
     * One can use fuzzy matchers, generated with the {@link any} method to verify the arguments.
     *
     * Example:
     * ```ts
     * const spy = t.spyOn(obj, 'process')
     *
     * // call the method 2 times with different arguments
     * obj.build('development', '1.0.0')
     * obj.build('release', '1.0.1')
     *
     * t.expect(spy).toHaveBeenCalledWith('development', '1.0.0');
     * // or
     * t.expect(obj.process).toHaveBeenCalledWith('development', t.any(String));
     * ```
     *
     * See also {@link toHaveBeenCalled}
     *
     * @param arg1 Argument to a call
     * @param arg2 Argument to a call
     * @param argN Argument to a call
     */
    toHaveBeenCalledWith (...args : unknown[]) {
        // @ts-ignore
        const spy           = this.value?.__SIESTA_SPY__ ?? this.value

        if (!(spy instanceof Spy)) throw new Error("This method can be called on spy instance or spy wrapper function")

        const condition     = spy.callsLog.some(callInfo => equalDeep(callInfo.args, args))
        const passed        = this.isNot ? !condition : condition

        const name          = 'expect(spy).toHaveBeenCalledWith(...arguments)'

        this.t.addResult(Assertion.new({
            name            : this.isNot ? this.t.negateExpectationName(name) : name,
            passed,

            annotation      : passed ? undefined : GotExpectTemplate.el({
                gotTitle    : 'The function being spied, has never been called with the expected arguments',
                got         : args
            })
        }))
    }
}


