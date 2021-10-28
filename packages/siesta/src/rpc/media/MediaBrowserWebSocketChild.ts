import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSON } from "./MediaSerializable.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class MediaBrowserWebSocketChild extends Mixin(
    [ MediaSerializableJSON, Base ],
    (base : ClassUnion<typeof MediaSerializableJSON, typeof Base>) =>

    class MediaBrowserWebSocketChild extends base {
        socket                  : WebSocket                     = undefined

        wsHost                  : string                        = ''
        wsPort                  : number                        = 0

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<void> {
            return new Promise((resolve, reject) => {
                const socket = this.socket = new WebSocket('wss://' + this.wsHost + ':' + this.wsPort)

                socket.addEventListener('open', event => {
                    socket.removeEventListener('close', connectionErrorRejection)

                    socket.addEventListener('close', event => this.onSocketClose(event))
                    socket.addEventListener('error', event => this.onSocketError(event))

                    socket.addEventListener('message', this.messageListener = (message : MessageEvent) => this.receiveMessage(message.data))

                    this.onSocketOpen(event)

                    resolve()
                })

                const connectionErrorRejection = event => reject(new Error("WebSocket child media connection error"))

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


        onSocketError (event : Event) {
        }


        sendMessage (message : any) {
            this.socket.send(message)
        }
    }
){}

