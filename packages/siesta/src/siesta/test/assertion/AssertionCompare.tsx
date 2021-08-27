import { Base } from "../../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { compareDeepDiff, comparePrimitiveAndFuzzyMatchers } from "../../../compare_deep/CompareDeepDiff.js"
import {
    any,
    anyNumberApprox,
    anyStringLike,
    Approximation,
    FuzzyMatcherAny,
    FuzzyMatcherInstance, FuzzyMatcherNumberApproximation,
    FuzzyMatcherString,
    NumberApproximation
} from "../../../compare_deep/FuzzyMatcherDiff.js"
import { CI } from "../../../iterator/Iterator.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../../../jsx/XmlElement.js"
import { SerializerXml } from "../../../serializer/SerializerXml.js"
import { isDate, isNumber, isRegExp, isString } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
type ComparisonTypeName = 'Equal' | 'Greater' | 'GreaterOrEqual' | 'Less' | 'LessOrEqual'

export const ComparisonType : { [ key in ComparisonTypeName ] : [ (a, b) => boolean, string ] } = {
    Equal               : [ (a, b) => a === b, 'equal' ],

    Greater             : [ (a, b) => a > b, 'greater' ],
    GreaterOrEqual      : [ (a, b) => a >= b, 'greater or equal' ],

    Less                : [ (a, b) => a < b, 'less' ],
    LessOrEqual         : [ (a, b) => a <= b, 'less or equal' ]
}


export const verifyExpectedNumber = (actual : number, expected : number | string) : boolean => {
    let operator        = '=='

    if (isString(expected)) {
        const match     = /(<|>|<=|>=|=|==|===)\s*(\d+)/.exec(expected)

        if (!match) throw new Error(`Unrecognized comparison format: ${ expected }`)

        operator        = match[ 1 ]
        expected        = Number(match[ 2 ])
    }

    switch (operator) {
        case '=' :
        case '==' :
        case '===' : return actual === expected

        case '<=' : return actual <= expected
        case '>=' : return actual >= expected
        case '<' : return actual < expected
        case '>' : return actual > expected
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class AssertionCompare extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionCompare extends base {

        // maxEqualityDifferences          : number        = 5


        //----------------------------------------------------
        // region truthy assertions

        assertTrueInternal (
            assertionName   : string,
            negated         : boolean,
            inverted        : boolean,
            value           : unknown,
            description     : string = ''
        ) {
            const passed        = negated || inverted ? !Boolean(value) : Boolean(value)

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    description         : `Expected is${ negated ? ' not ' : '' } ${ inverted ? '"falsy"' : '"truthy"' } value`,
                    got                 : value,
                    t                   : this
                })
            }))
        }

        /**
         * This assertion passes if provided value is "falsy" - `false`, `0`, `''` etc.
         * @param value
         * @param description
         */
        false<V> (value : V, description : string = '') {
            this.assertTrueInternal('false(received)', false, true, value, description)
        }

        /**
         * This assertion passes if provided value is "truthy" - `true`, `1`, `'non_empty_string'` etc
         * @param value
         * @param description
         */
        true<V> (value : V, description : string = '') {
            this.assertTrueInternal('true(received)', false, false, value, description)
        }


        /**
         * Backward compatibility alias for [[true]]
         * @param value
         * @param description
         */
        ok<V> (value : V, description : string = '') {
            this.assertTrueInternal('ok(received)', false, false, value, description)
        }

        /**
         * Backward compatibility alias for [[false]]
         * @param value
         * @param description
         */
        notOk<V> (value : V, description : string = '') {
            this.assertTrueInternal('notOk(received)', false, true, value, description)
        }

        not_ok<V> (value : V, description : string = '') {
            this.assertTrueInternal('not_ok(received)', false, true, value, description)
        }
        // eof backward compat
        // endregion


        //----------------------------------------------------
        // region equality assertions

        assertEqualToConstant (
            assertionName   : string,
            same            : boolean,
            negated         : boolean,
            value1          : unknown,
            value2          : unknown,
            description     : string = ''
        ) {
            const passed        = negated ? !same : same

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,

                annotation  : passed ? undefined : negated ? GotExpectTemplate.el({
                    got                 : value1,
                    expectTitle         : 'Expect value not equal to',
                    expect              : value2,
                    t                   : this
                }) : GotExpectTemplate.el({
                    got                 : value1,
                    expect              : value2,
                    t                   : this
                })
            }))
        }


        assertEqualityInternal (
            assertionName   : string,
            same            : boolean,
            negated         : boolean,
            value1          : unknown,
            value2          : unknown,
            description     : string = ''
        ) {
            const passed        = negated ? !same : same

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,

                annotation  : passed ? undefined : negated ? NotEqualAnnotationTemplate.el({
                    value               : value2,
                    t                   : this
                }) : GotExpectTemplate.el({
                    got                 : value1,
                    expect              : value2,
                    t                   : this
                })
            }))
        }


        assertStructuralEqualityInternal (
            assertionName   : string,
            negated         : boolean,
            value1          : unknown,
            value2          : unknown,
            description     : string = ''
        ) {
            const difference    = compareDeepDiff(value1, value2, this.descriptor.deepCompareConfig)
            const same          = difference.same
            const passed        = negated ? !same : same

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,

                annotation  : passed ? undefined : negated ? NotEqualAnnotationTemplate.el({
                    value               : value2,
                    t                   : this
                }) : <div>{ difference.template(this.descriptor.serializerConfig) }<div></div></div>
            }))
        }


        /**
         * A shorter alias for [[equal]]
         */
        eq<V> (received : V, expected : V, description : string = '') {
            this.assertStructuralEqualityInternal('eq(received, expected)', false, received, expected, description)
        }

        /**
         * A shorter alias for [[notEqual]]
         */
        ne<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('ne(received, expected)', false, value1, value2, description)
        }


        /**
         * This assertion passes if the received (left) and expected (right) values are "structurally" equal, the
         * so called "deep" equality.
         *
         * `Map`, `Set` and other native JavaScript data types are supported. Currently these objects are compared
         * by their content, any extra properties, set on them, will not be compared. We plan to support this
         * use case if there will be a demand for it.
         *
         * Cyclic data structures are supported. Fuzzy matchers, like [[any]], [[anyNumberApprox]], etc are supported
         * inside the `expected` data.
         *
         * @param received
         * @param expected
         * @param description
         */
        equal<V> (received : V, expected : V, description : string = '') {
            this.assertStructuralEqualityInternal('equal(received, expected)', false, received, expected, description)
        }


        /**
         * This assertion passes if the received (left) and expected (right) values are "structurally" *not* equal, the
         * so called "deep" inequality.
         *
         * See [[equal]] for details.
         *
         * @param value1
         * @param value2
         * @param description
         */
        notEqual<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('notEqual(received, expected)', true, value1, value2, description)
        }


        /**
         * Backward compatible alias for [[equal]]
         *
         * @param value1
         * @param value2
         * @param description
         */
        isDeeply<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('isDeeply(received, expected)', false, value1, value2, description)
        }
        // eof backward compat
        // endregion


        //----------------------------------------------------
        // region pattern matching

        assertMatchInternal (
            assertName      : string,
            negated         : boolean,
            string          : string,
            pattern         : string | RegExp,
            description     : string = ''
        ) {
            const assertionName     = negated ? this.negateExpectationName(assertName) : assertName
            const condition         = isRegExp(pattern) ? pattern.test(string) : String(string).indexOf(pattern) !== -1
            const passed            = negated ? !condition : condition

            const expectTitle       = `Expect string ${ negated ? 'not ' : '' }${ isRegExp(pattern) ? 'matching' : 'containing' }`

            this.addResult(Assertion.new({
                name            : assertionName,
                passed          : passed,
                description     : description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    gotTitle    : 'Received string',
                    got         : string,
                    expectTitle,
                    expect      : pattern,
                    t           : this
                })
            }))
        }


        match (string : string, pattern : RegExp | string, desc : string = '') {
            this.assertMatchInternal('match(received, expected)', false, string, pattern, desc)
        }


        notMatch (string : string, pattern : RegExp | string, desc : string = '') {
            this.assertMatchInternal('notMatch(received, expected)', true, string, pattern, desc)
        }


        // backward compat
        like (string : string, pattern : RegExp | string, desc : string = '') {
            this.assertMatchInternal('like(received, expected)', false, string, pattern, desc)
        }

        unlike (string : string, pattern : RegExp | string, desc : string = '') {
            this.assertMatchInternal('unlike(received, expected)', false, string, pattern, desc)
        }
        // eof backward compat
        // endregion


        //----------------------------------------------------
        // region "is" comparison

        comparePrimitives (value1 : unknown, value2 : unknown) : boolean {
            return comparePrimitiveAndFuzzyMatchers(value1, value2, this.descriptor.deepCompareConfig)
        }


        comparePrimitivesIs (value1 : unknown, value2 : unknown) : boolean {
            return isDate(value1) && isDate(value2) ? value1.getTime() === value2.getTime() : this.comparePrimitives(value1, value2)
        }

        /**
         * This assertion passes if the received and expected values are equal, as defined by the `===` operator.
         *
         * @param value1
         * @param value2
         * @param description
         */
        isStrict<V> (value1 : V, value2 : V, description : string = '') {
            this.assertEqualityInternal('isStrict(received, expected)', value1 === value2, false, value1, value2, description)
        }

        /**
         * This assertion passes if the received and expected values are equal, as defined by the `===` operator.
         * In addition, the fuzzy matchers, like [[any]], [[anyNumberApprox]], etc are supported for the `expected` value.
         *
         * If you are looking for deep structural equality, check [[equal]].
         *
         * @param received
         * @param expected
         * @param description
         */
        is<V> (received : V, expected : V, description : string = '') {
            this.assertEqualityInternal(
                'is(received, expected)',
                this.comparePrimitivesIs(received, expected),
                false,
                received,
                expected,
                description
            )
        }

        /**
         * The negated version of [[is]].
         *
         * @param value1
         * @param value2
         * @param description
         */
        isNot<V> (value1 : V, value2 : V, description : string = '') {
            this.assertEqualityInternal(
                'isNot(received, expected)',
                this.comparePrimitivesIs(value1, value2),
                true,
                value1,
                value2,
                description
            )
        }
        // endregion


        //----------------------------------------------------
        // region iterable contains

        assertIterableContainInternal<V> (
            assertionName   : string,
            negated         : boolean,
            iterable        : Iterable<V>,
            element         : V,
            description     : string = ''
        ) {
            const contains  = CI(iterable).some(value =>
                compareDeepDiff(value, element, this.descriptor.deepCompareConfig).same === true
            )

            const passed    = negated ? !contains : contains

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed          : passed,
                description     : description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    got         : iterable,
                    expectTitle : `Expect iterable ${ negated ? 'not ' : '' }containing`,
                    expect      : element,
                    t           : this
                })
            }))
        }

        /**
         * This assertion passes if the provided `iterable` contains the `element` value.
         * The element comparison is performed deeply.
         *
         * @param iterable
         * @param element
         * @param description
         */
        contain<V> (iterable : Iterable<V>, element : V, description : string = '') {
            this.assertIterableContainInternal('contain(received, element)', false, iterable, element)
        }


        /**
         * This assertion passes if the provided `iterable` does not contain the `element` value.
         * The element comparison is performed deeply.
         *
         * @param iterable
         * @param element
         * @param description
         */
        notContain<V> (iterable : Iterable<V>, element : V, description : string = '') {
            this.assertIterableContainInternal('notContain(received, element)', true, iterable, element)
        }
        // endregion


        //----------------------------------------------------
        // region compare

        assertCompareInternal<V> (
            assertionName   : string,
            negated         : boolean,
            op              : [ (a, b) => boolean, string ],
            value1          : unknown,
            value2          : unknown,
            description     : string = ''
        ) {
            const condition = op[ 0 ](value1, value2)
            const passed    = negated ? !condition : condition

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed          : passed,
                description     : description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    got         : value1,
                    expectTitle : `Expect value ${ negated ? 'not ' : '' }${ op[ 1 ] } than`,
                    expect      : value2,
                    t           : this
                })
            }))
        }

        /**
         * This assertion passes if the received value is greater than expected, as defined by the `>` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @param received
         * @param expected
         * @param description
         */
        isGreater (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isGreater(received, expected)', false, ComparisonType.Greater, received, expected)
        }

        /**
         * This assertion passes if the received value is greater or equal than expected, as defined by the `>=` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @param received
         * @param expected
         * @param description
         */
        isGreaterOrEqual (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isGreaterOrEqual(received, expected)', false, ComparisonType.GreaterOrEqual, received, expected)
        }

        /**
         * Alias for [[isGreaterOrEqual]]
         * @param received
         * @param expected
         * @param description
         */
        isGE (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isGE(received, expected)', false, ComparisonType.GreaterOrEqual, received, expected)
        }

        /**
         * This assertion passes if the received value is less than expected, as defined by the `<` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @param received
         * @param expected
         * @param description
         */
        isLess (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isLess(received, expected)', false, ComparisonType.Less, received, expected)
        }

        /**
         * This assertion passes if the received value is less than expected, as defined by the `<=` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @param received
         * @param expected
         * @param description
         */
        isLessOrEqual (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isLessOrEqual(received, expected)', false, ComparisonType.LessOrEqual, received, expected)
        }

        /**
         * Alias for [[isLessOrEqual]]
         * @param received
         * @param expected
         * @param description
         */
        isLE (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isLE(received, expected)', false, ComparisonType.LessOrEqual, received, expected)
        }
        // endregion


        //----------------------------------------------------
        // region compare approx

        assertCompareApproxInternal<V> (
            assertionName   : string,
            negated         : boolean,
            value1          : number,
            value2          : number,
            approximation   : NumberApproximation,
            description     : string = ''
        ) {
            const threshold     = approximation.getThreshold(value1)
            const condition     = approximation.equalApprox(value1, value2)
            const passed        = negated ? !condition : condition

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed          : passed,
                description     : description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    got         : value1,
                    expectTitle : `Expect value ${ negated ? 'not ' : '' }approximately equal to (threshold: ${ threshold })`,
                    expect      : value2,
                    t           : this
                })
            }))
        }

        /**
         * This assertion passes, if the received value is approximately equal to the expected.
         * The notion of "approximate equality" is defined with the `approx` attribute,
         * which is converted to the [[NumberApproximation]] with the [[NumberApproximation.fromApproximation]].
         *
         * @param received
         * @param expected
         * @param approx
         * @param description
         */
        isApprox (received : number, expected : number, approx : Approximation = { percent : 5 }, description : string = '') {
            if (arguments.length === 2) {
                approx              = NumberApproximation.new({ threshold : received * 0.05 })
            }
            else if (arguments.length === 3) {
                if (isString(approx)) {
                    description     = approx
                    approx          = NumberApproximation.new({ threshold : received * 0.05 })
                }
            }

            if (isNumber(approx)) approx = NumberApproximation.new({ threshold : approx })

            const approximation = NumberApproximation.maybeNew(approx)

            this.assertCompareApproxInternal('isApprox(received, expected)', false, received, expected, approximation, description)
        }


        /**
         * Backward compatibility method. Just bypasses to [[any]] to return a fuzzy matcher instance.
         *
         * @param args
         */
        any<T extends [] | [ AnyConstructor ]> (...args : T) : T extends [] ? any : T extends [ AnyConstructor<infer I> ] ? I : never {
            // @ts-ignore
            return any(...args)
        }

        /**
         * Backward compatibility method. Just bypasses to [[anyNumberApprox]] to return a fuzzy matcher instance.
         *
         * @param args
         */
        anyNumberApprox (value : number, approx : Approximation = { percent : 5 }) : FuzzyMatcherNumberApproximation {
            return anyNumberApprox(value, approx)
        }

        /**
         * Backward compatibility method. Just bypasses to [[anyStringLike]] to return a fuzzy matcher instance.
         *
         * @param args
         */
        anyStringLike (pattern : string | RegExp) : FuzzyMatcherString {
            return anyStringLike(pattern)
        }
        // eof backward compat

        // endregion
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class AnnotationTemplate extends Base {
    t                   : TestNodeResult            = undefined

    $serializerConfig   : Partial<SerializerXml>    = undefined


    get serializerConfig () : Partial<SerializerXml> {
        if (this.$serializerConfig !== undefined) return this.$serializerConfig

        return this.$serializerConfig = this.t ? this.t.descriptor.serializerConfig : { maxDepth : 4, maxBreadth : 4 }
    }

    set serializerConfig (value : Partial<SerializerXml>) {
        this.$serializerConfig = value
    }

    toXmlElement () : XmlElement {
        throw new Error("Abstract method")
    }


    static el<T extends typeof AnnotationTemplate> (this : T, props? : Partial<InstanceType<T>>) : XmlElement {
        return this.new(props).toXmlElement()
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class GotExpectTemplate extends AnnotationTemplate {
    description         : XmlNode       = ''

    description2        : XmlNode       = ''

    got                 : unknown

    gotTitle            : string        = 'Received'

    expect              : unknown

    expectTitle         : string        = 'Expected'


    // getTitleLengthEquality (label : 'got' | 'expect') : string {
    //     if (this.expect === undefined) return ''
    //
    //     const max       = Math.max(this.gotTitle.length, this.expectTitle.length)
    //
    //     return ' '.repeat(max - (label === 'got' ? this.gotTitle.length : this.expectTitle.length))
    // }


    toXmlElement () : XmlElement {
        return <div class="got_expected">
            { this.description || false }
            {
                this.hasOwnProperty('got') && <div class='got'>
                    <div class="underlined got_title">{ this.gotTitle }:</div>
                    <div class="indented got_value">{ SerializerXml.serialize(this.got, this.serializerConfig) }</div>
                </div>
            }
            { this.description2 || false }
            {
                this.hasOwnProperty('expect') && <div class='expect'>
                    <div class="underlined expect_title">{ this.expectTitle }:</div>
                    <div class="indented expect_value">{ SerializerXml.serialize(this.expect, this.serializerConfig) }</div>
                </div>
            }
        </div>
    }
}


// //---------------------------------------------------------------------------------------------------------------------
// export class DeepEqualAnnotationTemplate extends AnnotationTemplate {
//     differences         : Difference[]              = []
//
//
//     toXmlElement () : XmlElement {
//         return <div>
//             {/*Provided values are different. Here {*/}
//             {/*    differences.length === 1*/}
//             {/*        ?*/}
//             {/*    'is the difference found'*/}
//             {/*        :*/}
//             {/*    differences.length <= this.maxIsDeeplyDifferences*/}
//             {/*        ?*/}
//             {/*    'are the differences found'*/}
//             {/*        :*/}
//             {/*    `are the ${ this.maxIsDeeplyDifferences } differences from ${ differences.length } total`*/}
//             {/*}:*/}
//             <ul>{
//                 this.differences.map(difference =>
//                     <li class="difference">{ difference.asXmlNode(this.serializerConfig) }</li>
//                 )
//             }</ul>
//         </div>
//     }
// }


//---------------------------------------------------------------------------------------------------------------------
export class NotEqualAnnotationTemplate extends AnnotationTemplate {
    value           : unknown           = undefined


    toXmlElement () : XmlElement {
        return <div>
            The values we received and expect are equal. We expect the opposite.
            <div class='got'>
                <div class="underlined got_title">Both values are:</div>
                <div class="indented got_value">{ SerializerXml.serialize(this.value, this.serializerConfig) }</div>
            </div>
        </div>
    }
}