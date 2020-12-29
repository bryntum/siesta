import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelBrowserMessagePort extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) =>

    class ChannelBrowserMessagePort extends base {
        media                   : MessagePort                   = undefined

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<any> {
            this.media.addEventListener('message', this.messageListener = (e : MessageEvent) => {
                this.receiveMessage(e.data)
            })

            this.media.start()
        }


        async doDisconnect () : Promise<any> {
            this.media.removeEventListener('message', this.messageListener)

            this.messageListener    = undefined

            this.media.close()
        }


        sendMessage (message : any) {
            this.media.postMessage(message)
        }
    }
){}
