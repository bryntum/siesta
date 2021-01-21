import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


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

                    annotation      : GotExpectTemplate.el({
                        got         : instance,
                        gotTitle    : 'Got value',
                        expect      : cls,
                        expectTitle : 'Expect instance of'
                    })
                }))
            }
        }
    }
) {}
