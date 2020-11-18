import { ChildProcess, Serializable } from "child_process"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Channel, EnvelopCall, EnvelopResult } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelIpcParent extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) =>

    class ChannelIpcParent extends base {
        media                   : NodeJS.Process        = process

        messageListener         : (...args : any[]) => void      = undefined


        messageToEnvelop (message : any) : EnvelopCall | EnvelopResult | undefined {
            if (message.inResponseOf !== undefined)
                return EnvelopResult.new(message)
            else
                return EnvelopCall.new(message)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
            return envelop
        }


        async doConnect (media : this[ 'media' ]) : Promise<any> {
            this.media.addListener('message', this.messageListener = this.receiveMessage.bind(this))
        }


        async doDisconnect () : Promise<any> {
            this.messageListener && this.media.removeListener('message', this.messageListener)

            this.messageListener    = undefined
        }


        sendMessage (message : Serializable) {
            this.media.send(message)
        }
    }
){}

