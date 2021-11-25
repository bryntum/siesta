import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { isFunction, isString } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { GotExpectTemplate, verifyExpectedNumber } from "./AssertionCompare.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getPropertyName = <T extends object, K extends keyof T>(host : T, propertyValue : T[ K ]) : K => {
    for (const propertyName in host) {
        // @ts-ignore
        if (host[ propertyName ] === propertyValue) return propertyName
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
            let counter     = 0

            const prop : K  = isFunction(property) ? getPropertyName(obj, property as unknown as T[ K ]) : property

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
         * @param expected The expected number of calls
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isCalled<T extends object, K extends keyof T> (property : AnyFunction | K, object : T, expected : number | string, desc? : string) {
            this.assertExpectedCallNumber('isCalled', this.isAssertionNegated, property, object, '>=1', desc)
        }


        /**
         * This is a shortcut alias for [[isCalledNTimes]], with the `expected` argument hardcoded to the `1`.
         * It passes if the function property is called exactly once time during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param expected The expected number of calls
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isCalledOnce<T extends object, K extends keyof T> (property : AnyFunction | K, object : T, expected : number | string, desc? : string) {
            this.assertExpectedCallNumber('isCalledOnce', this.isAssertionNegated, property, object, 1, desc)
        }


        /**
         * This is a shortcut alias for [[isCalledNTimes]], with the `expected` argument hardcoded to the `0`.
         * It passes if the function property is not called during the test life span.
         *
         * @param property The function itself or the name of the function property on the host object (2nd argument)
         * @param object The host object
         * @param expected The expected number of calls
         * @param desc The description of the assertion
         *
         * @category Function calls assertions
         */
        isntCalled<T extends object, K extends keyof T> (property : AnyFunction | K, object : T, expected : number | string, desc? : string) {
            this.assertExpectedCallNumber('isntCalled', this.isAssertionNegated, property, object, 0, desc)
        }
    }
) {}


// /**
// @class Siesta.Test.Function
//
// This is a mixin, with helper methods for testing functionality relating to Functions (such as spies). This mixin is consumed by {@link Siesta.Test}
//
// */
// Role('Siesta.Test.Function', {
//
//     methods : {
//
//         /**
//          * This assertion passes when the supplied class method is called exactly (n) times during the test life span.
//          * Under "class method" here we mean the function in the prototype. Note, that this assertion counts calls to the method in *any* class instance.
//          *
//          * The `className` parameter can be supplied as a class constructor function or as a string, representing the class
//          * name. In the latter case the `class` will be eval'ed to get a reference to the class constructor.
//          *
//          * For example:
//
//     StartTest(function (t) {
//
//         function machine(type, version) {
//             this.machineInfo = {
//                 type        : type,
//                 version     : version
//             };
//         };
//
//         machine.prototype.update = function (type, version) {
//             this.setVersion(type);
//             this.setType(version);
//         };
//
//         machine.prototype.setVersion = function (data) {
//             this.machineInfo.version = data;
//         };
//
//         machine.prototype.setType = function (data) {
//             this.machineInfo.type = data;
//         };
//
//         t.methodIsCalled("setVersion", machine, "Checking if method 'setVersion' has been called");
//         t.methodIsCalled("setType", machine, "Checking if method 'setType' has been called");
//
//         var m = new machine('rover', '0.1.2');
//
//         m.update('3.2.1', 'New Rover');
//     });
//
//          *
//          * This assertion is useful when testing for example an Ext JS class where event listeners are added during
//          * class instantiation time, which means you need to observe the prototype method before instantiation.
//          *
//          * @param {Function/String} fn The function itself or the name of the method on the class (2nd argument)
//          * @param {Function/String} className The constructor function or the name of the class that contains the method
//          * @param {Number} n The expected number of calls
//          * @param {String} [desc] The description of the assertion
//          */
//         methodIsCalledNTimes: function(fn, className, n, desc, isGreaterEqual){
//             var me          = this,
//                 counter     = 0;
//             var R           = Siesta.Resource('Siesta.Test.Function');
//
//             desc            = desc ? (desc + ' ') : '';
//
//             try {
//                 if (me.typeOf(className) == 'String') className = me.global.eval(className)
//             } catch (e) {
//                 me.fail(desc, {
//                     assertionName       : 'isMethodCalled',
//                     annotation          : R.get('exceptionEvalutingClass').replace('{e}', e) + "[" + className + "]"
//                 })
//
//                 return
//             }
//
//             var prototype   = className.prototype;
//             var prop        = typeof fn === "string" ? fn : me.getPropertyName(prototype, fn);
//
//             me.on('beforetestfinalizeearly', function () {
//                 if (counter === n || (isGreaterEqual && counter > n)) {
//                     me.pass(desc || (prop + ' ' + R.get('methodCalledExactly').replace('{n}', n)));
//                 } else {
//                     me.fail(desc || prop, {
//                         assertionName       : 'methodIsCalledNTimes ' + prop,
//                         got                 : counter,
//                         need                : n ,
//                         needDesc            : R.get("Need") + " " + (isGreaterEqual ? R.get('atLeast') : R.get('exactly')) + " "
//                     });
//                 }
//             });
//
//             fn                  = prototype[ prop ];
//             prototype[ prop ]   = function () { counter++; return fn.apply(this, arguments); };
//         },
//
//         /**
//          * This assertion passes if the class method is called at least one time during the test life span.
//          *
//          * See {@link #methodIsCalledNTimes} for more details.
//          *
//          * @param {Function/String} fn The function itself or the name of the method on the class (2nd argument)
//          * @param {Function/String} className The class constructor function or name of the class that contains the method
//          * @param {String} [desc] The description of the assertion.
//          */
//         methodIsCalled : function(fn, className, desc) {
//             this.methodIsCalledNTimes(fn, className, 1, desc, true);
//         },
//
//         /**
//          * This assertion passes if the class method is not called during the test life span.
//          *
//          * See {@link #methodIsCalledNTimes} for more details.
//          *
//          * @param {Function/String} fn The function itself or the name of the method on the class (2nd argument)
//          * @param {Function/String} className The class constructor function or name of the class that contains the method
//          * @param {String} [desc] The description of the assertion.
//          */
//         methodIsntCalled : function(fn, className, desc) {
//             this.methodIsCalledNTimes(fn, className, 0, desc);
//         }
//     }
// });
