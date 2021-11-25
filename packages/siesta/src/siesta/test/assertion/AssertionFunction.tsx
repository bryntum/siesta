import { AnyConstructor, AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { isFunction, isString } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { GotExpectTemplate, verifyExpectedNumber } from "./AssertionCompare.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getPropertyName = <T extends object, K extends keyof T>(host : T, propertyValue : T[ K ]) : K => {
    let current : T     = host

    const seen          = new Set<string>()

    while (current && current !== Object.prototype) {
        const ownProperties     = Object.getOwnPropertyNames(current)

        for (const propertyName of ownProperties) {
            if (seen.has(propertyName)) continue

            seen.add(propertyName)

            // @ts-ignore
            if (host[ propertyName ] === propertyValue) return propertyName
        }

        current                 = Object.getPrototypeOf(current)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionFunction extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionFunction extends base {

        assertExpectedCallNumber<T extends object, K extends keyof T> (
            assertionName   : string,
            negated         : boolean,

            property        : AnyFunction | K,
            obj             : T,

            expected        : number | string,
            description     : string
        ) {
            const sourcePoint       = this.getSourcePoint()

            let counter     = 0

            const prop : K  = isFunction(property) ? getPropertyName(obj, property as unknown as T[ K ]) : property

            if (!prop) {
                this.addResult(Assertion.new({
                    name        : assertionName,
                    passed      : false,
                    description,
                    sourcePoint,
                    annotation  : <div>
                        Could not find the property for the function [{ property }]
                    </div>
                }))

                return
            }

            const original              = obj[ prop ]
            const isOriginalOwnProperty = obj.hasOwnProperty(prop)

            // @ts-ignore
            obj[ prop ]     = function () { counter++; return original.apply(this, arguments) }

            this.finishHook.once(() => {
                const expectedNumberOfCalls = verifyExpectedNumber(counter, expected)
                const passed                = negated ? !expectedNumberOfCalls : expectedNumberOfCalls

                this.addResult(Assertion.new({
                    name        : assertionName,
                    passed,
                    description,
                    sourcePoint,
                    annotation  : passed ? undefined : GotExpectTemplate.el({
                        description         : `Calls to ${ prop } property`,
                        gotTitle            : 'Actual',
                        got                 : counter,
                        expectTitle         : 'Expected' + (negated ? ', not' : ''),
                        expect              : expected,
                        t                   : this
                    })
                }))

                if (isOriginalOwnProperty)
                    // @ts-ignore
                    obj[ prop ]     = original
                else
                    delete obj[ prop ]
            })
        }


        /**
         * This assertion passes if the object's function property is called the expected number of times during the test life span.
         * The expected number of calls can be either a number or a string, consisting from the comparison operator
         * and a number. See [[FiresOkOptions.events]] for more details.
         *
         * For example:
         *
         * ```js
         * const obj = {
         *     data     : 1,
         *     increment : function () {
         *         return ++this.data
         *     }
         * }
         *
         * // exact number of calls
         * t.isCalledNTimes('increment', obj, 3, 'Correct number of calls to `increment`')
         *
         * // expected number of calls as expression
         * t.isCalledNTimes('increment', obj, '<= 3', 'Correct number of calls to `increment`')
         *
         * // passing property itself
         * t.isCalledNTimes(obj.increment, obj, 3, 'Correct number of calls to `increment`')
         * ```
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param expected The expected number of calls
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isCalledNTimes<T extends object, K extends keyof T> (
            property : AnyFunction | K, object : T, expected : number | string, desc? : string, isGreaterEqual? : boolean
        ) {
            if (isString(expected) && isGreaterEqual)
                throw new Error("The `isGreaterEqual` config should not be used with a expected number of calls specified as a string")

            const expect    = isString(expected)
                ? expected
                : isGreaterEqual
                    ? `>= ${ expected }`
                    : expected

            this.assertExpectedCallNumber('isCalledNTimes', this.isAssertionNegated, property, object, expect, desc)
        }


        /**
         * This is a shortcut alias for [[isCalledNTimes]], with the `expected` argument hardcoded to the `>= 1`.
         * It passes if the function property is called at least one time during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isCalled<T extends object, K extends keyof T> (property : AnyFunction | K, object : T, desc? : string) {
            this.assertExpectedCallNumber('isCalled', this.isAssertionNegated, property, object, '>=1', desc)
        }


        /**
         * This is a shortcut alias for [[isCalledNTimes]], with the `expected` argument hardcoded to the `1`.
         * It passes if the function property is called exactly once time during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isCalledOnce<T extends object, K extends keyof T> (property : AnyFunction | K, object : T, desc? : string) {
            this.assertExpectedCallNumber('isCalledOnce', this.isAssertionNegated, property, object, 1, desc)
        }


        /**
         * This is a shortcut alias for [[isCalledNTimes]], with the `expected` argument hardcoded to the `0`.
         * It passes if the function property is not called during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isntCalled<T extends object, K extends keyof T> (property : AnyFunction | K, object : T, desc? : string) {
            this.assertExpectedCallNumber('isntCalled', this.isAssertionNegated, property, object, 0, desc)
        }


        /**
         * This assertion passes when the supplied class method is called the expected number of times during the test life span.
         * The expected number of calls can be either a number or a string, consisting from the comparison operator
         * and a number. See [[FiresOkOptions.events]] for more details.
         *
         * Under "class method" here we mean the function in the prototype. Note, that this assertion counts calls to the method in *any* class instance.
         *
         * For example:
         *
         * ```javascript
         * class Car {
         *     constructor (type, version) {
         *         this.carInfo = {
         *             type        : type,
         *             version     : version
         *         }
         *     }
         *
         *     update (type, version) {
         *         this.setVersion(type);
         *         this.setType(version);
         *     }
         *
         *     setVersion (data) {
         *         this.carInfo.version = data;
         *     }
         *
         *     setType (data) {
         *         this.carInfo.type = data;
         *     }
         * };
         *
         * t.methodIsCalled("setVersion", Car, "Checking if method 'setVersion' has been called");
         * t.methodIsCalled("setType", Car, "Checking if method 'setType' has been called");
         *
         * const m = new Car('rover', '0.1.2');
         *
         * m.update('3.2.1', 'New Rover');
         * ```
         *
         * This assertion is useful when you need to verify the method calls during
         * class instantiation time, which means you need to observe the prototype method _before_ the instantiation.
         *
         * @param property The method function itself or its name
         * @param cls The class
         * @param expected The expected number of calls.
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        methodIsCalledNTimes<T extends AnyConstructor, K extends keyof InstanceType<T>> (
            property : AnyFunction | K, cls : T, expected : number | string, desc? : string, isGreaterEqual? : boolean
        ) {
            if (isString(expected) && isGreaterEqual)
                throw new Error("The `isGreaterEqual` config should not be used with a expected number of calls specified as a string")

            const expect    = isString(expected)
                ? expected
                : isGreaterEqual
                    ? `>= ${ expected }`
                    : expected

            this.assertExpectedCallNumber('methodIsCalledNTimes', this.isAssertionNegated, property, cls.prototype, expect, desc)
        }


        /**
         * This is a shortcut alias for [[methodIsCalledNTimes]], with the `expected` argument hardcoded to `>=1`.
         * It passes if the method is called at least once during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        methodIsCalled<T extends AnyConstructor, K extends keyof InstanceType<T>> (
            property : AnyFunction | K, cls : T, desc? : string
        ) {
            this.methodIsCalledNTimes(property, cls, '>=1', desc)
        }

        /**
         * This is a shortcut alias for [[methodIsCalledNTimes]], with the `expected` argument hardcoded to `0`.
         * It passes if the method is not called during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        methodIsntCalled<T extends AnyConstructor, K extends keyof InstanceType<T>> (
            property : AnyFunction | K, cls : T, desc? : string
        ) {
            this.methodIsCalledNTimes(property, cls, 0, desc)
        }
    }
) {}
