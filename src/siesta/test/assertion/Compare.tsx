import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { CI } from "../../../collection/Iterator.js"
import { compareDeepGen } from "../../../util/DeepCompare.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../Result.js"


//---------------------------------------------------------------------------------------------------------------------
export class Compare extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class Compare extends base {

        ok<V> (value : V, description : string = '') {
            this.addResult(Assertion.new({
                name            : 'ok',
                passed          : Boolean(value),
                description
            }))
        }


        is<V> (value1 : V, value2 : V, description : string = '') {
            this.addResult(Assertion.new({
                name            : 'is',
                passed          : value1 === value2,
                description
            }))
        }


        isDeeply<V> (value1 : V, value2 : V, description : string = '') {
            const differences   = CI(compareDeepGen(value1, value2)).take(5)

            if (differences.length > 0) {
                this.addResult(Assertion.new({
                    name            : 'isDeeply',
                    passed          : false,
                    description,

                    annotation      : <div>
                        Provided values are different. Here are { Math.min(differences.length, 5) } initial difference(s) from { differences.length } total
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
                    description
                }))
            }
        }
    }
) {}
