import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionType extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionType extends base {

        //----------------------------------------------------
        assertDefinedInternal (
            assertionName   : string,
            negated         : boolean,
            inverted        : boolean,
            value           : unknown,
            description     : string = ''
        ) {
            const condition1    = value !== undefined
            const condition2    = inverted ? !condition1 : condition1

            const passed        = negated ? !condition2 : condition2

            const title         = (negated && inverted) ? 'defined' : negated || inverted ? 'undefined' : 'defined'

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    description         : `Expected is ${ title } value`,
                    got                 : value,
                    t                   : this
                })
            }))
        }


        //----------------------------------------------------
        // region truthy assertions
        assertInstanceOfInternal (
            assertionName   : string,
            negated         : boolean,
            value           : unknown,
            cls             : AnyConstructor,
            description     : string = ''
        ) {
            const condition     = Object.getPrototypeOf(value) === cls.prototype || (value instanceof cls)

            const passed        = negated ? !condition : condition

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    got                 : value,
                    description2        : <div>Expect { negated ? 'not ' : '' }an instance of <span class="accented">{ cls.name || cls.toString() }</span></div>,
                    t                   : this
                })
            }))
        }

        /**
         * This assertion passes if the received `value` is an instance of the `cls` class. It works for native built-in classes
         * too.
         *
         * For example:
         * ```ts
         * t.isInstanceOf([ 1, 2, 3 ], Array)
         *
         * t.isInstanceOf(1, Number)
         * ```
         *
         * @param value The recieved value
         * @param cls The class constructor
         * @param description
         */
        isInstanceOf (value : unknown, cls : AnyConstructor, description : string = '') {
            this.assertInstanceOfInternal('isInstanceOf(received, cls)', false, value, cls, description)
        }

        // backward compat
        isaOk (value : unknown, cls : AnyConstructor, description : string = '') {
            this.assertInstanceOfInternal('isaOk(received, cls)', false, value, cls, description)
        }

        isa_ok (value : unknown, cls : AnyConstructor, description : string = '') {
            this.assertInstanceOfInternal('isa_ok(received, cls)', false, value, cls, description)
        }
        // eof backward compat


        /**
         * This assertion passes if the received `value` is a `Boolean`.
         *
         * @param value
         * @param description
         */
        isBoolean (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isBoolean(received)', false, value, Boolean, description)
        }

        /**
         * This assertion passes if the received `value` is a `String`.
         * @param value
         * @param description
         */
        isString (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isString(received)', false, value, String, description)
        }

        /**
         * This assertion passes if the received `value` is a `Number`.
         * @param value
         * @param description
         */
        isNumber (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isNumber(received)', false, value, Number, description)
        }

        /**
         * This assertion passes if the received `value` is a `Object`.
         * @param value
         * @param description
         */
        isObject (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isObject(received)', false, value, Object, description)
        }

        /**
         * This assertion passes if the received `value` is a `Array`.
         * @param value
         * @param description
         */
        isArray (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isArray(received)', false, value, Array, description)
        }

        /**
         * This assertion passes if the received `value` is a `Date`.
         * @param value
         * @param description
         */
        isDate (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isDate(received)', false, value, Date, description)
        }

        /**
         * This assertion passes if the received `value` is a `RegExp`.
         * @param value
         * @param description
         */
        isRegExp (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isRegExp(received)', false, value, RegExp, description)
        }

        /**
         * This assertion passes if the received `value` is a `Function`.
         * @param value
         * @param description
         */
        isFunction (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isFunction(received)', false, value, Function, description)
        }

        /**
         * This assertion passes if the received `value` is a `Set`.
         * @param value
         * @param description
         */
        isSet (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isSet(received)', false, value, Set, description)
        }

        /**
         * This assertion passes if the received `value` is a `Map`.
         * @param value
         * @param description
         */
        isMap (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isMap(received)', false, value, Map, description)
        }

        /**
         * This assertion passes if the received `value` is a `WeakSet`.
         * @param value
         * @param description
         */
        isWeakSet (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isWeakSet(received)', false, value, WeakSet, description)
        }

        /**
         * This assertion passes if the received `value` is a `WeakMap`.
         * @param value
         * @param description
         */
        isWeakMap (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isWeakMap(received)', false, value, WeakMap, description)
        }
    }
) {}
