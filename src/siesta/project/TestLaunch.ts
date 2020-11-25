import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestNodeResult } from "../test/Result.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestLaunch extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class TestLaunch extends base {
        testNodeResult          : TestNodeResult        = undefined

        on
    }
) {}
