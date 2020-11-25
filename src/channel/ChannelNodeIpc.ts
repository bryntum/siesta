import { ChildProcess, Serializable } from "child_process"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Channel, EnvelopCall, EnvelopResult } from "./Channel.js"
import { ChannelSerializable } from "./ChannelSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelNodeIpcParent extends Mixin(
    [ ChannelSerializable ],
    (base : ClassUnion<typeof ChannelSerializable>) =>

    class ChannelNodeIpcParent extends base {
        media                   : ChildProcess

        messageListener         : (...args : any[]) => void      = undefined
        exitListener            : (...args : any[]) => void      = undefined


        // messageToEnvelop (message : any) : EnvelopCall | EnvelopResult | undefined {
        //     if (message.inResponseOf !== undefined)
        //         return EnvelopResult.new(message)
        //     else
        //         return EnvelopCall.new(message)
        // }
        //
        //
        // envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
        //     return envelop
        // }


        async doConnect () : Promise<any> {
            this.media.addListener('message', this.messageListener = this.receiveMessage.bind(this))

            this.media.addListener('exit', this.exitListener = () => {
                this.logger && this.logger.debug('NodeJS child process exit')

                this.disconnect()
            })
        }


        async doDisconnect () : Promise<any> {
            this.media.removeListener('message', this.messageListener)
            this.media.removeListener('exit', this.exitListener)

            this.messageListener    = undefined
            this.exitListener       = undefined

            this.media.disconnect()
        }


        sendMessage (message : Serializable) {
            this.media.send(message)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelNodeIpcChild extends Mixin(
    [ ChannelSerializable ],
    (base : ClassUnion<typeof ChannelSerializable>) =>

    class ChannelNodeIpcChild extends base {
        media                   : NodeJS.Process                = process

        messageListener         : (...args : any[]) => void     = undefined


        // messageToEnvelop (message : any) : EnvelopCall | EnvelopResult | undefined {
        //     if (message.inResponseOf !== undefined)
        //         return EnvelopResult.new(message)
        //     else
        //         return EnvelopCall.new(message)
        // }
        //
        //
        // envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
        //     return envelop
        // }


        async doConnect () : Promise<any> {
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
