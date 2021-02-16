import { AnyConstructor, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionGeneral extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionGeneral extends base {
    }
) {}
