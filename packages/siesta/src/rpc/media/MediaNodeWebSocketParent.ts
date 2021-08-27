import ws from 'ws'
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSON } from "./MediaSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaNodeWebSocketParent extends Mixin(
    [ MediaSerializableJSON, Base ],
    (base : ClassUnion<typeof MediaSerializableJSON, typeof Base>) =>

    class MediaNodeWebSocketParent extends base {
        socket                  : ws                            = undefined

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<void> {
            this.socket.addEventListener('message', this.messageListener = (message : ws.MessageEvent) => this.receiveMessage(message.data))

            this.socket.addEventListener('close', event => this.onSocketClose(event))
        }


        onSocketClose (event : { wasClean : boolean; code : number; reason : string; target : ws }) {
            this.port.disconnect()
        }


        async doDisconnect () : Promise<any> {
            if (this.socket) {
                this.socket.removeEventListener('message', this.messageListener)

                this.messageListener    = undefined
            }
        }


        sendMessage (message : any) {
            this.socket.send(message)
        }
    }
){}


