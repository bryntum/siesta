import { Channel } from "../../channel/Channel.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { Agent } from "../agent/Agent.js"
import { Project, ProjectPlanItem } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class AgentData {}


//---------------------------------------------------------------------------------------------------------------------
export class Dispatcher extends Mixin(
    [ Channel ],
    (base : AnyConstructor<Channel, typeof Channel>) =>

    class Dispatcher extends base {
        project         : Project                   = undefined

        agents          : Map<Agent, AgentData>     = new Map()

        linearizedPlan  : ProjectPlanItem[]         = []


        async start () {
        }
    }
) {}
