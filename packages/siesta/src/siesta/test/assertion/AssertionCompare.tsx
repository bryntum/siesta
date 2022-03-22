import { exclude, serializable } from "typescript-serializable-mixin"
import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { compareDeepDiff, comparePrimitiveAndFuzzyMatchers } from "../../../compare_deep/DeepDiff.js"
import {
    any, anyArrayContaining,
    anyNumberApprox, anyObjectContaining,
    anyStringLike,
    Approximation, FuzzyMatcherArrayContaining,
    FuzzyMatcherNumberApproximation, FuzzyMatcherObjectContaining,
    FuzzyMatcherString,
    NumberApproximation
} from "../../../compare_deep/DeepDiffFuzzyMatcher.js"
import { CI } from "../../../iterator/Iterator.js"
import { XmlRenderBlock } from "../../../jsx/RenderBlock.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { serializeToElement, SerialOptions } from "../../../serializer/Serial.js"
import { SerialElement } from "../../../serializer/SerialRendering.js"
import { DowngradePrimitives } from "../../../util/Helpers.js"
import { isDate, isNumber, isRegExp, isString } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionCompare extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionCompare extends base {

        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
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
         *
         * @category Boolean comparison
         * @param value
         * @param description
         */
        false<V> (value : V, description : string = '') {
            this.assertTrueInternal('false(received)', false, true, value, description)
        }

        /**
         * This assertion passes if provided value is "truthy" - `true`, `1`, `'non_empty_string'` etc
         *
         * @category Boolean comparison
         * @param value
         * @param description
         */
        true<V> (value : V, description : string = '') {
            this.assertTrueInternal('true(received)', false, false, value, description)
        }


        /**
         * Backward compatibility alias for [[true]]
         *
         * @category Boolean comparison
         * @param value
         * @param description
         */
        ok<V> (value : V, description : string = '') {
            this.assertTrueInternal('ok(received)', false, false, value, description)
        }

        /**
         * Backward compatibility alias for [[false]]
         *
         * @category Boolean comparison
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


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
                passed,
                description,

                // TODO probably does not make sense to use special annotation for negated version?
                // we just show the diff
                // annotation  : passed
                //     ? undefined
                //     : negated
                //         ? NotEqualAnnotationTemplate.el({
                //             value               : value2,
                //             t                   : this
                //         })
                //         : difference.template()

                annotation  : passed ? undefined : difference.template()
            }))
        }


        /**
         * A shorter alias for [[equal]]
         *
         * @category Equality
         */
        eq<V> (received : V, expected : V, description : string = '') {
            this.assertStructuralEqualityInternal('eq(received, expected)', this.isAssertionNegated, received, expected, description)
        }

        /**
         * A shorter alias for [[notEqual]]. Can be also written as `t.not.eq()`, see [[not|t.not]] for details.
         *
         * @category Equality
         */
        ne<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('ne(received, expected)', !this.isAssertionNegated, value1, value2, description)
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
         * @category Equality
         *
         * @param received
         * @param expected
         * @param description
         */
        equal<V> (received : V, expected : V, description : string = '') {
            this.assertStructuralEqualityInternal('equal(received, expected)', this.isAssertionNegated, received, expected, description)
        }


        /**
         * This assertion passes if the received (left) and expected (right) values are "structurally" *not* equal, the
         * so called "deep" inequality.
         *
         * See [[equal]] for details.
         *
         * @category Equality
         * @param value1
         * @param value2
         * @param description
         */
        notEqual<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('notEqual(received, expected)', !this.isAssertionNegated, value1, value2, description)
        }


        /**
         * Backward compatible alias for [[equal]]
         *
         * @category Equality
         * @param value1
         * @param value2
         * @param description
         */
        isDeeply<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('isDeeply(received, expected)', this.isAssertionNegated, value1, value2, description)
        }
        // eof backward compat
        // endregion


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        // region pattern matching

        assertMatchInternal (
            assertName      : string,
            negated         : boolean,
            string          : string,
            pattern         : string | RegExp,
            description     : string = ''
        ) {
            const assertionName     = negated ? this.negateAssertionName(assertName) : assertName
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

        /**
         * This assertion passes when provided `string` matches the given `pattern`.
         *
         * The `pattern` can be a `RegExp` instance or `string`, in the latter case the provided `string`
         * should contain the `pattern` as a substring.
         *
         * @category String pattern matching
         * @param string
         * @param pattern
         * @param desc
         */
        match (string : string, pattern : RegExp | string, desc : string = '') {
            this.assertMatchInternal('match(received, expected)', this.isAssertionNegated, string, pattern, desc)
        }


        /**
         * This assertion passes when provided `string` does not matches the given `pattern`.
         *
         * The `pattern` can be a `RegExp` instance or `string`, in the latter case the provided `string`
         * should not contain the `pattern` as a substring.
         *
         * @category String pattern matching
         * @param string
         * @param pattern
         * @param desc
         */
        notMatch (string : string, pattern : RegExp | string, desc : string = '') {
            this.assertMatchInternal('notMatch(received, expected)', !this.isAssertionNegated, string, pattern, desc)
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


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        // region "is" comparison

        comparePrimitives (value1 : unknown, value2 : unknown, strictEquality : boolean = true) : boolean {
            return comparePrimitiveAndFuzzyMatchers(value1, value2, this.descriptor.deepCompareConfig, strictEquality)
        }


        comparePrimitivesIs (value1 : unknown, value2 : unknown) : boolean {
            return isDate(value1) && isDate(value2) ? value1.getTime() === value2.getTime() : this.comparePrimitives(value1, value2, false)
        }

        /**
         * This assertion passes if the received and expected values are equal, as defined by the `===` operator.
         *
         * @category Equality
         * @param value1
         * @param value2
         * @param description
         */
        isStrict<V> (value1 : V, value2 : V, description : string = '') {
            this.assertEqualityInternal('isStrict(received, expected)', value1 === value2, this.isAssertionNegated, value1, value2, description)
        }

        /**
         * This is Siesta 5 backward compatible assertion, which performs comparison of the 2 values, using the `==` comparison.
         * So, `null` will be equal to `undefined`, `4` to `"4"` and so on. As an additional quirk, `Date` instances
         * are compared structurally, by their time, instead of by reference.
         *
         * The fuzzy matchers, like [[any]], [[anyNumberApprox]], etc are supported for the `expected` value.
         *
         * It is recommended to use the deep structural equality instead of this assertion, check [[equal]] and its
         * shortcut alias [[eq]].
         *
         * @category Equality
         * @param received
         * @param expected
         * @param description
         */
        is<V> (received : V, expected : V, description : string = '') {
            this.assertEqualityInternal(
                'is(received, expected)',
                this.comparePrimitivesIs(received, expected),
                this.isAssertionNegated,
                received,
                expected,
                description
            )
        }

        /**
         * The negated version of [[is]]. Can be also written as `t.not.is()`. See [[not|t.not]] for details.
         *
         * @category Equality
         * @param value1
         * @param value2
         * @param description
         */
        isNot<V> (value1 : V, value2 : V, description : string = '') {
            this.assertEqualityInternal(
                'isNot(received, expected)',
                this.comparePrimitivesIs(value1, value2),
                !this.isAssertionNegated,
                value1,
                value2,
                description
            )
        }
        // endregion


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
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


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
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
         * @category Numeric comparison
         * @param received
         * @param expected
         * @param description
         */
        isGreater (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isGreater(received, expected)', this.isAssertionNegated, ComparisonType.Greater, received, expected)
        }

        /**
         * This assertion passes if the received value is greater or equal than expected, as defined by the `>=` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @category Numeric comparison
         * @param received
         * @param expected
         * @param description
         */
        isGreaterOrEqual (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isGreaterOrEqual(received, expected)', this.isAssertionNegated, ComparisonType.GreaterOrEqual, received, expected)
        }

        /**
         * Alias for [[isGreaterOrEqual]]
         *
         * @category Numeric comparison
         * @param received
         * @param expected
         * @param description
         */
        isGE (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isGE(received, expected)', this.isAssertionNegated, ComparisonType.GreaterOrEqual, received, expected)
        }

        /**
         * This assertion passes if the received value is less than expected, as defined by the `<` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @category Numeric comparison
         * @param received
         * @param expected
         * @param description
         */
        isLess (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isLess(received, expected)', this.isAssertionNegated, ComparisonType.Less, received, expected)
        }

        /**
         * This assertion passes if the received value is less than expected, as defined by the `<=` operator.
         * It works for numbers, Dates and other values that overloads the `valueOf` method.
         *
         * @category Numeric comparison
         * @param received
         * @param expected
         * @param description
         */
        isLessOrEqual (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isLessOrEqual(received, expected)', this.isAssertionNegated, ComparisonType.LessOrEqual, received, expected)
        }

        /**
         * Alias for [[isLessOrEqual]]
         *
         * @category Numeric comparison
         * @param received
         * @param expected
         * @param description
         */
        isLE (received : unknown, expected : unknown, description : string = '') {
            this.assertCompareInternal('isLE(received, expected)', this.isAssertionNegated, ComparisonType.LessOrEqual, received, expected)
        }
        // endregion


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
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
                name            : negated ? this.negateAssertionName(assertionName) : assertionName,
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
         * @category Fuzzy comparison
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
         * A wrapper for the [[any]] fuzzy matcher helper
         *
         * @category Fuzzy comparison
         */
        any<T extends [] | [ AnyConstructor ]> (...args : T) : T extends [] ? any : T extends [ AnyConstructor<infer I> ] ? DowngradePrimitives<I> : never {
            // @ts-ignore
            return any(...args)
        }

        /**
         * A wrapper for the [[anyNumberApprox]] fuzzy matcher helper.
         *
         * @category Fuzzy comparison
         */
        anyNumberApprox (value : number, approx : Approximation = { percent : 5 }) : number {
            // @ts-ignore
            return anyNumberApprox(value, approx)
        }


        /**
         * A wrapper for the [[anyStringLike]] fuzzy matcher helper.
         *
         * @category Fuzzy comparison
         */
        anyStringLike (pattern : string | RegExp) : string {
            // @ts-ignore
            return anyStringLike(pattern)
        }


        /**
         * A wrapper for the [[anyArrayContaining]] fuzzy matcher helper.
         *
         * @category Fuzzy comparison
         */
        anyArrayContaining (expected : unknown[]) : [] {
            // @ts-ignore
            return anyArrayContaining(expected)
        }


        /**
         * A wrapper for the [[anyObjectContaining]] fuzzy matcher helper.
         *
         * @category Fuzzy comparison
         */
        anyObjectContaining (expected : Record<string, unknown>) : Record<string, unknown> {
            // @ts-ignore
            return anyObjectContaining(expected)
        }
        // endregion
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'AnnotationTemplate' })
export class AnnotationTemplate extends XmlElement {
    tagName             : string                    = 'div'

    @exclude()
    t                   : TestNodeResult            = undefined

    @exclude()
    $serializerConfig   : Partial<SerialOptions>    = undefined


    get serializerConfig () : Partial<SerialOptions> {
        if (this.$serializerConfig !== undefined) return this.$serializerConfig

        return this.$serializerConfig = this.t ? this.t.descriptor.serializerConfig : { maxDepth : 4, maxBreadth : 4 }
    }

    set serializerConfig (value : Partial<SerialOptions>) {
        this.$serializerConfig = value
    }


    toXmlElement () : XmlElement {
        throw new Error("Abstract method")
    }


    renderContent (context : XmlRenderBlock) {
        this.toXmlElement().renderContent(context)
    }


    static el<T extends typeof AnnotationTemplate> (this : T, props? : Partial<InstanceType<T>>) : XmlElement {
        return this.new(props)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'GotExpectTemplate' })
export class GotExpectTemplate extends AnnotationTemplate {
    description         : string        = undefined

    description2        : string        = undefined

    @exclude()
    got                 : unknown

    gotEl               : SerialElement = undefined

    gotTitle            : string        = 'Received'

    @exclude()
    expect              : unknown

    expectEl            : SerialElement = undefined

    expectTitle         : string        = 'Expected'


    initialize (props? : Partial<GotExpectTemplate>) {
        super.initialize(props)

        this.gotEl      = this.hasOwnProperty('got') ? serializeToElement(this.got, this.serializerConfig) : undefined
        this.expectEl   = this.hasOwnProperty('expect') ? serializeToElement(this.expect, this.serializerConfig) : undefined

        this.got        = this.expect = undefined
    }


    // getTitleLengthEquality (label : 'got' | 'expect') : string {
    //     if (this.expect === undefined) return ''
    //
    //     const max       = Math.max(this.gotTitle.length, this.expectTitle.length)
    //
    //     return ' '.repeat(max - (label === 'got' ? this.gotTitle.length : this.expectTitle.length))
    // }


    toXmlElement () : XmlElement {
        return <div class="got_expected">
            { this.description }
            {
                this.gotEl && <div class='got'>
                    <div class="underlined got_title">{ this.gotTitle }:</div>
                    <div class="indented got_value">{ this.gotEl }</div>
                </div>
            }
            { this.description2 }
            {
                this.expectEl && <div class='expect'>
                    <div class="underlined expect_title">{ this.expectTitle }:</div>
                    <div class="indented expect_value">{ this.expectEl }</div>
                </div>
            }
        </div>
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'NotEqualAnnotationTemplate' })
export class NotEqualAnnotationTemplate extends AnnotationTemplate {
    @exclude()
    value           : unknown           = undefined

    valueEl         : SerialElement     = undefined


    initialize (props? : Partial<GotExpectTemplate>) {
        super.initialize(props)

        this.valueEl    = serializeToElement(this.value, this.serializerConfig)

        this.value      = undefined
    }


    toXmlElement () : XmlElement {
        return <div>
            The values we received and expect are equal. We expect the opposite.
            <div class='got'>
                <div class="underlined got_title">Both values are:</div>
                <div class="indented got_value">{ this.valueEl }</div>
            </div>
        </div>
    }
}
