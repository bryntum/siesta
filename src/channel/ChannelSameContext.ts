import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Channel, EnvelopCall, EnvelopResult } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelSameContext extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) =>

    class ChannelSameContext extends base {
        media           : ChannelSameContext

        messageToEnvelop (message : any) : EnvelopCall | EnvelopResult | undefined {
            if (message.inResponseOf !== undefined)
                return EnvelopResult.fromPlainObject(message)
            else
                return EnvelopCall.fromPlainObject(message)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
            return envelop
        }


        async doConnect (media : this[ 'media' ]) : Promise<any> {
            // do nothing
        }

        async doDisconnect () : Promise<any> {
            // do nothing
        }


        async sendMessage (message : any) : Promise<any> {
            this.media.receiveMessage(message)
        }
    }
){}

