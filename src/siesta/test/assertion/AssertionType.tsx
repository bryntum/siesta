import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
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


        isInstanceOf (value : unknown, cls : AnyConstructor, description : string = '') {
            this.assertInstanceOfInternal('isInstanceOf(received, cls)', false, value, cls, description)
        }


        isBoolean (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isBoolean(received)', false, value, Boolean, description)
        }

        isString (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isString(received)', false, value, String, description)
        }

        isNumber (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isNumber(received)', false, value, Number, description)
        }

        isObject (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isObject(received)', false, value, Object, description)
        }

        isArray (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isArray(received)', false, value, Array, description)
        }

        isDate (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isDate(received)', false, value, Date, description)
        }

        isRegExp (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isRegExp(received)', false, value, RegExp, description)
        }

        isFunction (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isFunction(received)', false, value, Function, description)
        }

        isSet (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isSet(received)', false, value, Set, description)
        }

        isMap (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isMap(received)', false, value, Map, description)
        }

        isWeakSet (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isWeakSet(received)', false, value, WeakSet, description)
        }

        isWeakMap (value : unknown, description : string = '') {
            this.assertInstanceOfInternal('isWeakMap(received)', false, value, WeakMap, description)
        }
    }
) {}
