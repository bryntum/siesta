import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestNodeResultReactive } from "../test/TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestLaunchInfo extends Mixin(
    [ Entity, Base ],
    (base : ClassUnion<typeof Entity, typeof Base>) =>

    class TestLaunchInfo extends base {
        descriptor          : TestDescriptor            = undefined

        @field()
        mostRecentResult    : TestNodeResultReactive    = undefined


        initialize (props? : Partial<TestLaunchInfo>) {
            super.initialize(props)

            this.enterGraph(globalGraph as Replica)
        }
    }
) {}
