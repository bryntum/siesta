import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { CI } from "../../../iterator/Iterator.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { SerializerXml } from "../../../serializer/SerializerXml.js"
import { compareDeepGen, comparePrimitivesGen, Difference } from "../../../util/CompareDeep.js"
import { isDate, isRegExp } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
type ComparisonTypeName = 'Greater' | 'GreaterOrEqual' | 'Less' | 'LessOrEqual'

export const ComparisonType : { [ key in ComparisonTypeName ] : [ (a, b) => boolean, string ] } = {
    Greater             : [ (a, b) => a > b, 'greater' ],
    GreaterOrEqual      : [ (a, b) => a >= b, 'greater or equal' ],

    Less                : [ (a, b) => a < b, 'less' ],
    LessOrEqual         : [ (a, b) => a <= b, 'less or equal' ]
}


//---------------------------------------------------------------------------------------------------------------------
export class AssertionCompare extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionCompare extends base {

        maxEqualityDifferences          : number        = 5


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


        false<V> (value : V, description : string = '') {
            this.assertTrueInternal('false(received)', false, true, value, description)
        }


        true<V> (value : V, description : string = '') {
            this.assertTrueInternal('true(received)', false, false, value, description)
        }


        // backward compat
        ok<V> (value : V, description : string = '') {
            this.assertTrueInternal('ok(received)', false, false, value, description)
        }


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
            const differences   = CI(compareDeepGen(value1, value2, this.descriptor.deepCompareConfig)).take(this.maxEqualityDifferences)
            const passed        = negated ? differences.length > 0 : differences.length === 0

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,

                annotation  : passed ? undefined : negated ? NotEqualAnnotationTemplate.el({
                    value               : value2,
                    t                   : this
                }) : DeepEqualAnnotationTemplate.el({
                    differences,
                    t                   : this
                })
            }))
        }


        eq<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('eq(received, expected)', false, value1, value2, description)
        }


        ne<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('ne(received, expected)', false, value1, value2, description)
        }


        equal<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('equal(received, expected)', false, value1, value2, description)
        }


        notEqual<V> (value1 : V, value2 : V, description : string = '') {
            this.assertStructuralEqualityInternal('notEqual(received, expected)', true, value1, value2, description)
        }


        // backward compat
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
            return CI(comparePrimitivesGen(value1, value2, this.descriptor.deepCompareConfig)).take(1).length === 0
        }


        comparePrimitivesIs (value1 : unknown, value2 : unknown) : boolean {
            return isDate(value1) && isDate(value2) ? value1.getTime() === value2.getTime() : this.comparePrimitives(value1, value2)
        }


        isStrict<V> (value1 : V, value2 : V, description : string = '') {
            this.assertEqualityInternal('isStrict(received, expected)', value1 === value2, false, value1, value2, description)
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            this.assertEqualityInternal(
                'is(received, expected)',
                this.comparePrimitivesIs(value1, value2),
                false,
                value1,
                value2,
                description
            )
        }


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
                CI(compareDeepGen(value, element, this.descriptor.deepCompareConfig)).take(1).length === 0
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


        contain<V> (iterable : Iterable<V>, element : V, description : string = '') {
            this.assertIterableContainInternal('contain(received, element)', false, iterable, element)
        }


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


        isGreater (value1 : unknown, value2 : unknown, description : string = '') {
            this.assertCompareInternal('isGreater(received, expected)', false, ComparisonType.Greater, value1, value2)
        }

        isGreaterOrEqual (value1 : unknown, value2 : unknown, description : string = '') {
            this.assertCompareInternal('isGreaterOrEqual(received, expected)', false, ComparisonType.GreaterOrEqual, value1, value2)
        }

        isLess (value1 : unknown, value2 : unknown, description : string = '') {
            this.assertCompareInternal('isLess(received, expected)', false, ComparisonType.Less, value1, value2)
        }

        isLessOrEqual (value1 : unknown, value2 : unknown, description : string = '') {
            this.assertCompareInternal('isLessOrEqual(received, expected)', false, ComparisonType.LessOrEqual, value1, value2)
        }
        // endregion
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class AnnotationTemplate extends Base {
    t                   : TestNodeResult            = undefined

    $serializerConfig   : Partial<SerializerXml>    = undefined


    get serializerConfig () : Partial<SerializerXml> {
        if (this.$serializerConfig !== undefined) return this.$serializerConfig

        return this.$serializerConfig = this.t ? this.t.descriptor.serializerConfig : { maxDepth : 4, maxWide : 4 }
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
    description : string        = ''

    got         : unknown

    gotTitle    : string        = 'Received'

    expect      : unknown

    expectTitle : string        = 'Expected'


    // getTitleLengthEquality (label : 'got' | 'expect') : string {
    //     if (this.expect === undefined) return ''
    //
    //     const max       = Math.max(this.gotTitle.length, this.expectTitle.length)
    //
    //     return ' '.repeat(max - (label === 'got' ? this.gotTitle.length : this.expectTitle.length))
    // }


    toXmlElement () : XmlElement {
        return <div class="indented got_expected">
            { this.description || false }
            {
                this.hasOwnProperty('got') && <div class='got'>
                    <div class="underlined got_title">{ this.gotTitle }:</div>
                    <div class="indented got_value">{ SerializerXml.serialize(this.got, this.serializerConfig) }</div>
                </div>
            }
            {
                this.hasOwnProperty('expect') && <div class='expect'>
                    <div class="underlined expect_title">{ this.expectTitle }:</div>
                    <div class="indented expect_value">{ SerializerXml.serialize(this.expect, this.serializerConfig) }</div>
                </div>
            }
        </div>
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class DeepEqualAnnotationTemplate extends AnnotationTemplate {
    differences         : Difference[]              = []


    toXmlElement () : XmlElement {
        return <div>
            {/*Provided values are different. Here {*/}
            {/*    differences.length === 1*/}
            {/*        ?*/}
            {/*    'is the difference found'*/}
            {/*        :*/}
            {/*    differences.length <= this.maxIsDeeplyDifferences*/}
            {/*        ?*/}
            {/*    'are the differences found'*/}
            {/*        :*/}
            {/*    `are the ${ this.maxIsDeeplyDifferences } differences from ${ differences.length } total`*/}
            {/*}:*/}
            <ul>{
                this.differences.map(difference =>
                    <li class="difference">{ difference.asXmlNode(this.serializerConfig) }</li>
                )
            }</ul>
        </div>
    }
}


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
