import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TreeNodeMapped } from "../../tree/TreeNodeMapped.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestNodeResultReactive } from "../test/TestResultReactive.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLaunchResult extends Mixin(
    [ TreeNodeMapped, Base ],
    (base : ClassUnion<typeof TreeNodeMapped, typeof Base>) =>

    class TestLaunchInfo extends base {
        descriptor          : TestDescriptor            = undefined

        mostRecentResult    : TestNodeResultReactive    = undefined
    }
) {}
