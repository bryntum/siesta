import { ClassUnion, Mixin } from "../class/Mixin.js"
import { reviver } from "../serializable/Serializable.js"
import { Channel, EnvelopCall, EnvelopResult } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelSerializableJSON extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) =>

    class ChannelSerializableJSON extends base {

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


//---------------------------------------------------------------------------------------------------------------------
export class ChannelSerializablePlain extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) =>

    class ChannelSerializablePlain extends base {

        messageToEnvelop (message : any) : EnvelopCall | EnvelopResult | undefined {
            if (message.inResponseOf !== undefined)
                return EnvelopResult.maybeNew(message)
            else
                return EnvelopCall.maybeNew(message)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
            return envelop
        }
    }
){}

