import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { CI } from "../../../collection/Iterator.js"
import { compareDeepGen } from "../../../util/DeepCompare.js"
import { typeOf } from "../../../util/Helpers.js"
import { Serializer } from "../../../util/Serializer.js"
import { isRegExp } from "../../../util/Typeguards.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../Result.js"


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
                sourceLine      : this.getSourceLine(),
                description,

                annotation      : passed ? null : <div>
                    <unl class='difference_got_expected'>
                        <li class='difference_got'>
                            <span class="difference_title">Got    : </span>
                            <span class="difference_value">{ Serializer.serialize(value1, { maxDepth : 4, maxWide : 4 }) }</span>
                        </li>
                        <li class='difference_expected'>
                            <span class="difference_title">Expect : </span>
                            <span class="difference_value">{ Serializer.serialize(value2, { maxDepth : 4, maxWide : 4 }) }</span>
                        </li>
                    </unl>
                </div>
            }))
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            const passed        = value1 === value2

            this.addResult(Assertion.new({
                name            : 'is',
                passed,
                sourceLine      : this.getSourceLine(),
                description,

                annotation      : passed ? null : <div>
                    <unl class='difference_got_expected'>
                        <li class='difference_got'>
                            <span class="difference_title">Got    : </span>
                            <span class="difference_value">{ Serializer.serialize(value1, { maxDepth : 4, maxWide : 4 }) }</span>
                        </li>
                        <li class='difference_expected'>
                            <span class="difference_title">Expect : </span>
                            <span class="difference_value">{ Serializer.serialize(value2, { maxDepth : 4, maxWide : 4 }) }</span>
                        </li>
                    </unl>
                </div>
            }))
        }


        isNot<V> (value1 : V, value2 : V, description : string = '') {
            const passed        = value1 !== value2

            this.addResult(Assertion.new({
                name            : 'isNot',
                passed,
                sourceLine      : this.getSourceLine(),
                description,

                annotation      : passed ? null : <div>
                    The value we got is equal to the value we expect
                    <p>
                        <span class="difference_title">Value : </span>
                        <span class="difference_value">{ Serializer.serialize(value1, { maxDepth : 4, maxWide : 4 }) }</span>
                    </p>
                </div>
            }))
        }


        isDeeply<V> (value1 : V, value2 : V, description : string = '') {
            const differences   = CI(compareDeepGen(value1, value2)).take(5)

            if (differences.length > 0) {
                this.addResult(Assertion.new({
                    name            : 'isDeeply',
                    passed          : false,
                    sourceLine      : this.getSourceLine(),
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
                                <li class="difference">{ difference.asXmlNode() }</li>
                            )
                        }</ul>
                    </div>
                }))

            } else {
                this.addResult(Assertion.new({
                    name            : 'isDeeply',
                    passed          : true,
                    sourceLine      : this.getSourceLine(),
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
                        sourceLine      : this.getSourceLine(),
                        description     : desc
                    }))
                } else {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : false,
                        sourceLine      : this.getSourceLine(),
                        description     : desc,
                        annotation      : <div>
                            <unl class='difference_got_expected'>
                                <li class='difference_got'>
                                    <span class="difference_title">Got string             : </span>
                                    <span class="difference_value">{ Serializer.serialize(string, { maxDepth : 4, maxWide : 4 }) }</span>
                                </li>
                                <li class='difference_expected'>
                                    <span class="difference_title">Expect string matching : </span>
                                    <span class="difference_value">{ Serializer.serialize(pattern, { maxDepth : 4, maxWide : 4 }) }</span>
                                </li>
                            </unl>
                        </div>
                    }))
                }
            } else {
                if (String(string).indexOf(pattern) !== -1) {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : true,
                        sourceLine      : this.getSourceLine(),
                        description     : desc
                    }))
                } else {
                    this.addResult(Assertion.new({
                        name            : 'like',
                        passed          : false,
                        sourceLine      : this.getSourceLine(),
                        description     : desc,
                        annotation      : <div>
                            <unl class='difference_got_expected'>
                                <li class='difference_got'>
                                    <span class="difference_title">Got string               : </span>
                                    <span class="difference_value">{ Serializer.serialize(string, { maxDepth : 4, maxWide : 4 }) }</span>
                                </li>
                                <li class='difference_expected'>
                                    <span class="difference_title">Expect string containing : </span>
                                    <span class="difference_value">{ Serializer.serialize(pattern, { maxDepth : 4, maxWide : 4 }) }</span>
                                </li>
                            </unl>
                        </div>
                    }))
                }
            }
        }
    }
) {}
