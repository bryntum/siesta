import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { CI } from "../../../collection/Iterator.js"
import { compareDeepGen, Difference } from "../../../util/DeepCompare.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { XmlStream } from "../../jsx/XmlElement.js"
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
                        <ul>{ differences.map(difference => <li class="difference">{ difference.asXmlNode() }</li>) }</ul>
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




//---------------------------------------------------------------------------------------------------------------------
/* samples of failing assertions:

is:

[is] Assertion description at line 537 of `source/file.t.js`
got      : 123
expected : 1234


isDeeply:

[isDeeply] Assertion description at line 537 of `source/file.t.js`

Provided value is different from the expected. List of differences:

- prop1[ 5 ] is different:
    got      : 'asd'
    expected : 'das'
- prop1.prop2 is an array of length 5 and expected array has length of 3
    extra elements [3..4]: [ 13, 11 ] [[no more than 5]]

- prop2.prop3 is an array of length 3 and expected array has length of 5
    missing elements [3..4]: [ 13, 11 ] [[no more than 5]]

- prop2.get({ id : 13, ... }[[no more than 2, prefer `id/type/key/`).prop3[ 4 ] is different:
    got      : 'asd'
    expected : 'das'
 */
