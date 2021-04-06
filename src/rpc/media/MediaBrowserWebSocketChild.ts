import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSON } from "./MediaSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaBrowserWebSocketChild extends Mixin(
    [ MediaSerializableJSON ],
    (base : ClassUnion<typeof MediaSerializableJSON>) =>

    class MediaBrowserWebSocketChild extends base {
        socket                  : WebSocket                     = undefined

        wsHost                  : string                        = ''
        wsPort                  : number                        = 0

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<void> {
            return new Promise((resolve, reject) => {
                const socket = this.socket = new WebSocket('ws://' + this.wsHost + ':' + this.wsPort)

                socket.addEventListener('open', event => {
                    socket.removeEventListener('close', connectionErrorRejection)

                    socket.addEventListener('close', event => this.onSocketClose(event))

                    socket.addEventListener('message', this.messageListener = message => this.receiveMessage(message))

                    this.onSocketOpen(event)

                    resolve()
                })

                const connectionErrorRejection = event => reject("Connection error")

                socket.addEventListener('close', connectionErrorRejection)
            })
        }


        async doDisconnect () : Promise<any> {
            const socket        = this.socket

            this.socket.removeEventListener('message', this.messageListener)

            this.messageListener    = undefined

            if (socket && socket.readyState != socket.CLOSED) {
                socket.close()

                this.socket     = undefined
            }
        }


        onSocketOpen (event : Event) {
        }


        onSocketClose (event : CloseEvent) {
            this.port.disconnect()
        }


        sendMessage (message : any) {
            this.socket.send(message)
        }
    }
){}

