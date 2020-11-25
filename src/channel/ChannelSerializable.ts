import { ClassUnion, Mixin } from "../class/Mixin.js"
import { reviver } from "../serializable/Serializable.js"
import { Channel, EnvelopCall, EnvelopResult } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelSerializable extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) =>

    class ChannelSerializable extends base {

        messageToEnvelop (message : string) : EnvelopCall | EnvelopResult | undefined {
            const obj : any      = JSON.parse(message, reviver)

            if (obj.inResponseOf !== undefined)
                return EnvelopResult.new(obj)
            else
                return EnvelopCall.new(obj)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : string {
            return JSON.stringify(envelop)
        }
    }
){}

