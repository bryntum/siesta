import { Base } from "../../class/Base.js"
import { AnyFunction } from "../../class/Mixin.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { isString } from "../../util/Typeguards.js"
import { ComparisonType, GotExpectTemplate } from "./assertion/AssertionCompare.js"
import { Test } from "./Test.js"


//---------------------------------------------------------------------------------------------------------------------
export class Expectation extends Base {

    value           : unknown           = undefined

    isNot           : boolean           = false

    t               : Test              = undefined


    get not () : Expectation {
        const cls       = this.constructor as typeof Expectation

        return cls.new({ value : this.value, isNot : !this.isNot, t : this.t })
    }



    /**
     * This assertion compares the value provided to the {@link Siesta.Test#expect expect} method with the `expectedValue` argument.
     * Comparison is done with `===` operator, so it should be used **only with the primitives** - numbers, strings, booleans etc.
     * However, placeholders, generated with the `any*` family of methods are supported.
     *
     * To deeply compare `Date`, `Arrays` and JSON objects in general, use {@link #toEqual} method.
     *
     * This method works correctly with the placeholders generated with {@link Siesta.Test#any any} method
     *
     * @param {Primitive} expectedValue An expected value
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


    toBeEqual (expectedValue : unknown) {
        this.t.assertStructuralEqualityInternal('expect(received).toBeEqual(expected)', this.isNot, this.value, expectedValue)
    }


    /**
     * This assertion compares the value provided to the {@link Siesta.Test#expect expect} method with the `expectedValue` argument.
     *
     * Comparison works for Date, Array, and JSON objects in general. It is performed "deeply".
     *
     * This method works correctly with the placeholders generated with {@link Siesta.Test#any any} method
     *
     * @param {Mixed} expectedValue An expected value
     */
    toEqual (expectedValue : unknown) {
        this.t.assertStructuralEqualityInternal('expect(received).toEqual(expected)', this.isNot, this.value, expectedValue)
    }


    /**
     * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is `null`.
     */
    toBeNull () {
        this.t.assertEqualToConstant('expect(received).toBeNull()', this.value === null, this.isNot, this.value, null)
    }


    /**
     * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is `NaN`.
     */
    toBeNaN () {
        this.t.assertEqualToConstant('expect(received).toBeNaN()', Number.isNaN(this.value), this.isNot, this.value, NaN)
    }


    /**
     * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is not the `undefined` value.
     */
    toBeDefined () {
        this.t.assertDefinedInternal('expect(received).toBeDefined()', this.isNot, false, this.value)
    }


    /**
     * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is the `undefined` value.
     */
    toBeUndefined () {
        this.t.assertDefinedInternal('expect(received).toBeUndefined()', this.isNot, true, this.value)
    }


    /**
     * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is "truthy" - evaluates to `true`.
     * For example - non empty strings, numbers except the 0, objects, arrays etc.
     */
    toBeTruthy () {
        this.t.assertTrueInternal('expect(received).toBeTruthy()', this.isNot, false, this.value)
    }


    /**
     * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is "falsy" - evaluates to `false`.
     * For example - empty strings, number 0, `null`, `undefined`, etc.
     */
    toBeFalsy () {
        this.t.assertTrueInternal('expect(received).toBeFalsy()', this.isNot, true, this.value)
    }


    /**
     * This assertion passes, when the string provided to the {@link Siesta.Test#expect expect} method matches the regular expression.
     *
     * @param {RegExp} regexp The regular expression to match the string against
     */
    toMatch (regexp : RegExp) {
        this.t.assertMatchInternal('expect(received).toMatch(expected)', this.isNot, this.value as string, regexp)
    }


    /**
     * This assertion passes in 2 cases:
     *
     * 1) When the value provided to the {@link Siesta.Test#expect expect} method is a string, and it contains a passed substring.
     * 2) When the value provided to the {@link Siesta.Test#expect expect} method is an array (or array-like), and it contains a passed element.
     *
     * @param {String/Mixed} element The element of the array or a sub-string
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
     * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is less than the
     * expected number.
     *
     * @param {Number} expectedValue The number to compare with
     */
    toBeLessThan (expectedValue : number) {
        this.t.assertCompareInternal('expect(received).toBeLessThan(expected)', false, ComparisonType.Greater, this.value, expectedValue)
    }


    /**
     * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is greater than the
     * expected number.
     *
     * @param {Number} expectedValue The number to compare with
     */
    toBeGreaterThan (expectedValue) {
        this.t.assertCompareInternal('expect(received).toBeGreaterThan(expected)', false, ComparisonType.Greater, this.value, expectedValue)
    }


    /**
     * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is approximately equal
     * the given number. The proximity can be defined as the `precision` argument
     *
     * @param {Number} expectedValue The number to compare with
     * @param {Number} [precision=2] The number of digits after dot (comma) that should be same in both numbers.
     */
    toBeCloseTo (expectedValue : number, precision : number = 2) {
        const threshold   = Math.pow(10, -precision)
        const delta       = Math.abs(this.value as number - expectedValue)

        this.process(delta < threshold, 'expect(received).toBeCloseTo(expected)', GotExpectTemplate.el({
            got         : this.value,
            expect      : expectedValue,
            expectTitle : `Expect value ${ this.isNot ? 'not' : '' } close to (threshold: ${ threshold })`
        }))
    }


    /**
     * This assertion passes when the function provided to the {@link Siesta.Test#expect expect} method, throws an exception
     * during its execution.
     *
     * t.expect(function(){
     *     throw "oopsie";
     * }).toThrow());
     *
     */
    async toThrow (pattern? : string | RegExp) {
        return this.t.assertThrowInternal('expect(func).toThrow()', this.isNot, this.value as AnyFunction, this.t.getSourceLine(), pattern)
    }


//     /**
//      * This assertion passes, if a spy, provided to the {@link Siesta.Test#expect expect} method have been
//      * called expected number of times. The expected number of times can be provided as the 1st argument and by default
//      * is 1.
//      *
//      * One can also provide the function, spied on, to the {@link Siesta.Test#expect expect} method.
//      *
//      * Examples:
//      *
// const spy = t.spyOn(obj, 'process')
//
// // call the method 2 times
// obj.process()
// obj.process()
//
// // following 2 calls are equivalent
// t.expect(spy).toHaveBeenCalled();
// t.expect(obj.process).toHaveBeenCalled();
//
// // one can also use exact number of calls or comparison operators
// t.expect(obj.process).toHaveBeenCalled(2);
// t.expect(obj.process).toHaveBeenCalled('>1');
// t.expect(obj.process).toHaveBeenCalled('<=3');
//
//      *
//      * See also {@link #toHaveBeenCalledWith}
//      *
//      * @param {Number/String} expectedNumber Expected number of calls. Can be either a number, specifying the exact
//      * number of calls, or a string. In the latter case one can include a comparison operator in front of the number.
//      *
//      */
//     toHaveBeenCalled (expectedNumber) {
//         expectedNumber  = expectedNumber != null ? expectedNumber : '>=1'
//
//         const spy         = this.value
//         const t           = this.t
//         const R           = Siesta.Resource('Siesta.Test.BDD.Expectation');
//
//         if (this.typeOf(spy) == 'Function') {
//             if (!spy.__SIESTA_SPY__) throw new Error(R.get('wrongSpy'))
//
//             spy         = spy.__SIESTA_SPY__
//         }
//
//         if (!(spy instanceof Siesta.Test.BDD.Spy)) throw new Error(R.get('wrongSpy'))
//
//         this.process(t.verifyExpectedNumber(spy.callsLog.length, expectedNumber), {
//             descTpl             : R.get('toHaveBeenCalledDescTpl'),
//             assertionName       : 'expect(func).toHaveBeenCalled()',
//             methodName          : spy.propertyName || '[function]',
//             got                 : spy.callsLog.length,
//             gotDesc             : R.get('actualNbrOfCalls'),
//             need                : (this.isNot ? 'not ' : '') + expectedNumber,
//             needDesc            : R.get('expectedNbrOfCalls')
//         })
//     }
//
//
//     /**
//      * This assertion passes, if a spy, provided to the {@link Siesta.Test#expect expect} method have been
//      * called at least once with the specified arguments.
//      *
//      * One can also provide the function, spied on, to the {@link Siesta.Test#expect expect} method.
//      *
//      * One can use placeholders, generated with the {@link Siesta.Test.BDD#any any} method to verify the arguments.
//      *
//      * Example:
//      *
//
// const spy = t.spyOn(obj, 'process')
//
// // call the method 2 times with different arguments
// obj.build('development', '1.0.0')
// obj.build('release', '1.0.1')
//
// t.expect(spy).toHaveBeenCalledWith('development', '1.0.0');
// // or
// t.expect(obj.process).toHaveBeenCalledWith('development', t.any(String));
//
//      *
//      * See also {@link #toHaveBeenCalled}
//      *
//      * @param {Object} arg1 Argument to a call
//      * @param {Object} arg2 Argument to a call
//      * @param {Object} argN Argument to a call
//      */
//     toHaveBeenCalledWith () {
//         const spy         = this.value
//         const t           = this.t
//         const R           = Siesta.Resource('Siesta.Test.BDD.Expectation');
//
//         if (this.typeOf(spy) == 'Function') {
//             if (!spy.__SIESTA_SPY__) throw new Error(R.get('wrongSpy'))
//
//             spy         = spy.__SIESTA_SPY__
//         }
//
//         if (!(spy instanceof Siesta.Test.BDD.Spy)) throw new Error(R.get('wrongSpy'))
//
//         const args                        = Array.prototype.slice.call(arguments)
//         const foundCallWithMatchingArgs   = false
//
//         Joose.A.each(spy.callsLog, function (call) {
//             if (t.compareObjects(call.args, args)) { foundCallWithMatchingArgs = true; return false }
//         })
//
//         this.process(foundCallWithMatchingArgs, {
//             descTpl             : R.get('toHaveBeenCalledWithDescTpl'),
//             assertionName       : 'expect(func).toHaveBeenCalledWith()',
//             methodName          : spy.propertyName,
//             noGot               : true
//         })
//     }
}


