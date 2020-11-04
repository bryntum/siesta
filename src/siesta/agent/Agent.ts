import { local, remote } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { Dispatcher } from "../project/Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class Agent extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) => {

        class Agent extends base {
            idSource            : number            = 0



            dispatcher          : Dispatcher        = undefined

            maxWorkers          : number            = 1


            @remote()
            sendProgress : () => Promise<any>


            @local()
            receiveExecutionPlan (plan) {
            }
        }

        return Agent
    }
) {}
