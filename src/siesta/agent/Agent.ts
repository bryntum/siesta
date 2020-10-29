import { local, remote } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
export class Agent extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) => {

        class Agent extends base {

            @remote()
            sendProgress : () => Promise<any>


            @local()
            receiveExecutionPlan () {
            }
        }

        return Agent
    }
) {}
