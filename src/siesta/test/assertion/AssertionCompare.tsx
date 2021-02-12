import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { CI } from "../../../iterator/Iterator.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { SerializerXml } from "../../../serializer/SerializerXml.js"
import { compareDeepGen, Difference } from "../../../util/CompareDeep.js"
import { isDate, isRegExp } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionCompare extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionCompare extends base {

        maxIsDeeplyDifferences      : number        = 5


        ok<V> (value : V, description : string = '') {
            return this.true(value, description)
        }


        true<V> (value : V, description : string = '') {
            const passed        = !Boolean(value)

            this.addResult(Assertion.new({
                name            : 't.true(received)',
                passed,
                description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    description         : 'Expected is "truthy" value',
                    got                 : value,
                    serializerConfig    : this.descriptor.serializerConfig
                })
            }))
        }


        notOk<V> (value : V, description : string = '') {
            return this.false(value, description)
        }

        false<V> (value : V, description : string = '') {
            const passed        = !Boolean(value)

            this.addResult(Assertion.new({
                name            : 'false',
                passed,
                description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    description         : 'Expected is "falsy" value',
                    got                 : value,
                    serializerConfig    : this.descriptor.serializerConfig
                })
            }))
        }


        isStrict<V> (value1 : V, value2 : V, description : string = '') {
            const passed        = value1 === value2

            this.addResult(Assertion.new({
                name            : 'isStrict',
                passed,
                description,

                annotation      : passed ? undefined : GotExpectTemplate.el({
                    got     : value1,
                    expect  : value2,
                    serializerConfig : this.descriptor.serializerConfig
                })
            }))
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            const passed        = isDate(value1) && isDate(value2) ? value1.getTime() === value2.getTime() : value1 === value2

            this.addResult(Assertion.new({
                name            : 'is',
                passed,
                description,

                annotation      : passed ? undefined : GotExpectTemplate.el({
                    got     : value1,
                    expect  : value2,
                    serializerConfig : this.descriptor.serializerConfig
                })
            }))
        }


        isNot<V> (value1 : V, value2 : V, description : string = '') {
            const passed        = isDate(value1) && isDate(value2) ? value1.getTime() !== value2.getTime() : value1 !== value2

            this.addResult(Assertion.new({
                name            : 'isNot',
                passed,
                description,

                annotation      : passed ? undefined : NotEqualAnnotationTemplate.el({ value : value2, serializerConfig : this.descriptor.serializerConfig })
            }))
        }


        isDeeply<V> (value1 : V, value2 : V, description : string = '') {
            this.equal(value1, value2, description)
        }


        equal<V> (value1 : V, value2 : V, description : string = '') {
            const differences   = CI(compareDeepGen(value1, value2, this.descriptor.deepCompareConfig)).take(5)
            const passed        = differences.length === 0

            this.addResult(Assertion.new({
                name            : 'isDeeply',
                passed,
                description,

                annotation      : passed ? undefined : DeepEqualAnnotationTemplate.el({
                    differences,
                    serializerConfig    : this.descriptor.serializerConfig
                })
            }))
        }


        like (string : string, pattern : RegExp | string, desc : string = '') {

            if (isRegExp(pattern)) {
                if (pattern.test(string)) {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : true,
                        description     : desc
                    }))
                } else {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : false,
                        description     : desc,
                        annotation      : GotExpectTemplate.el({
                            got         : string,
                            gotTitle    : 'Got string',
                            expect      : pattern,
                            expectTitle : 'Expect string matching',
                            serializerConfig : this.descriptor.serializerConfig
                        })
                    }))
                }
            } else {
                if (String(string).indexOf(pattern) !== -1) {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : true,
                        description     : desc
                    }))
                } else {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : false,
                        description     : desc,
                        annotation      : GotExpectTemplate.el({
                            got         : string,
                            gotTitle    : 'Got string',
                            expect      : pattern,
                            expectTitle : 'Expect string containing',
                            serializerConfig : this.descriptor.serializerConfig
                        })
                    }))
                }
            }
        }
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

    got         : unknown       = undefined

    gotTitle    : string        = 'Received'

    expect      : unknown       = undefined

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
                this.got !== undefined && <div class='got'>
                    <div class="underlined got_title">{ this.gotTitle }:</div>
                    <div class="indented got_value">{ SerializerXml.serialize(this.got, this.serializerConfig) }</div>
                </div>
            }
            {
                this.expect !== undefined && <div class='expect'>
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
