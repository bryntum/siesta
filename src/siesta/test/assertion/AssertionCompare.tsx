import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { CI } from "../../../iterator/Iterator.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { SerializerXml } from "../../../serializer/SerializerXml.js"
import { compareDeepGen } from "../../../util/CompareDeep.js"
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
            this.addResult(Assertion.new({
                name            : 'true',
                passed          : Boolean(value),
                description
            }))
        }


        notOk<V> (value : V, description : string = '') {
            return this.false(value, description)
        }

        false<V> (value : V, description : string = '') {
            this.addResult(Assertion.new({
                name            : 'false',
                passed          : !Boolean(value),
                description
            }))
        }


        isStrict<V> (value1 : V, value2 : V, description : string = '') {
            const passed        = value1 === value2

            this.addResult(Assertion.new({
                name            : 'is',
                passed,
                description,

                annotation      : passed ? null : GotExpectTemplate.el({
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

                annotation      : passed ? null : GotExpectTemplate.el({
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

                annotation      : passed ? null : <div>
                    The value we got is equal to the value we expect
                    <p>
                        <span class="difference_title">Value : </span>
                        <span class="difference_value">{ SerializerXml.serialize(value1, this.descriptor.serializerConfig) }</span>
                    </p>
                </div>
            }))
        }


        isDeeply<V> (value1 : V, value2 : V, description : string = '') {
            this.equal(value1, value2, description)
        }


        equal<V> (value1 : V, value2 : V, description : string = '') {
            const differences   = CI(compareDeepGen(value1, value2)).take(5)

            if (differences.length > 0) {
                this.addResult(Assertion.new({
                    name            : 'isDeeply',
                    passed          : false,
                    description,

                    annotation      : <div>
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
                            differences.map(difference =>
                                <li class="difference">{ difference.asXmlNode(this.descriptor.serializerConfig) }</li>
                            )
                        }</ul>
                    </div>
                }))

            } else {
                this.addResult(Assertion.new({
                    name            : 'isDeeply',
                    passed          : true,
                    description
                }))
            }
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
export class GotExpectTemplate extends Base {
    got         : unknown       = undefined

    gotTitle    : string        = 'Got'

    expect      : unknown       = undefined

    expectTitle : string        = 'Expect'

    serializerConfig    : Partial<SerializerXml>   = { maxDepth : 4, maxWide : 4 }


    getTitleLengthEquality (label : 'got' | 'expect') : string {
        if (this.expect === undefined) return ''

        const max       = Math.max(this.gotTitle.length, this.expectTitle.length)

        return ' '.repeat(max - (label === 'got' ? this.gotTitle.length : this.expectTitle.length))
    }


    static el<T extends typeof GotExpectTemplate> (this : T, props? : Partial<InstanceType<T>>) : XmlElement {
        const instance      = this.new(props) as InstanceType<T>

        return <div class="indented got_expected">
            <div class='got'>
                <div class="underlined got_title">{ instance.gotTitle }:</div>
                <div class="indented got_value">{ SerializerXml.serialize(instance.got, instance.serializerConfig) }</div>
            </div>
            {
                instance.expect !== undefined && <div class='expect'>
                    <div class="underlined expect_title">{ instance.expectTitle }:</div>
                    <div class="indented expect_value">{ SerializerXml.serialize(instance.expect, instance.serializerConfig) }</div>
                </div>
            }
        </div>
    }
}
