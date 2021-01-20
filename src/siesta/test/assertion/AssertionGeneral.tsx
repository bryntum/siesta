import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { Serializer } from "../../../util/Serializer.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../Result.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionGeneral extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionGeneral extends base {

        isInstanceOf (instance : unknown, cls : AnyConstructor, description : string = '') {
            if (instance instanceof cls) {
                this.addResult(Assertion.new({
                    name            : 'throws',
                    passed          : true,
                    description,
                }))
            } else {
                this.addResult(Assertion.new({
                    name            : 'isInstanceOf',
                    passed          : false,
                    description,

                    annotation      : <div>
                        <unl class='difference_got_expected'>
                            <li class='difference_got'>
                                <span class="difference_title">Got value          : </span>
                                <span class="difference_value">{Serializer.serialize(instance, {maxDepth: 4, maxWide: 4})}</span>
                            </li>
                            <li class='difference_expected'>
                                <span class="difference_title">Expect instance of : </span>
                                <span class="difference_value">{Serializer.serialize(cls, {maxDepth: 4, maxWide: 4})}</span>
                            </li>
                        </unl>
                    </div>
                }))
            }
        }
    }
) {}
