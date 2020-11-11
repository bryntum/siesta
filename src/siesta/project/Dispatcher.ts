import { Channel } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { Agent } from "../agent/Agent.js"
import { ProjectPlanItem } from "./Plan.js"
import { Project} from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class AgentData {}


//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) =>

    class Dispatcher extends base {
        project         : Project                   = undefined

        agents          : Map<Agent, AgentData>     = new Map()

        linearizedPlan  : ProjectPlanItem[]         = []


        async start () {
        }
    }
) {}
