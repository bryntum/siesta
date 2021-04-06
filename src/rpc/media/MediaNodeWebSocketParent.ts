import WebSocket from 'ws'
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSON } from "./MediaSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaNodeWebSocketParent extends Mixin(
    [ MediaSerializableJSON ],
    (base : ClassUnion<typeof MediaSerializableJSON>) =>

    class MediaNodeWebSocketParent extends base {
        socket                  : WebSocket                     = undefined

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<void> {
            this.socket.addEventListener('message', this.messageListener = message => this.receiveMessage(message))
        }


        async doDisconnect () : Promise<any> {
            this.socket.removeEventListener('message', this.messageListener)

            this.messageListener    = undefined
        }


        sendMessage (message : any) {
            this.socket.send(message)
        }
    }
){}


