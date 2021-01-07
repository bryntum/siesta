import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Media } from "./Port.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaBrowserMessagePort extends Mixin(
    [ Media ],
    (base : ClassUnion<typeof Media>) =>

    class MediaBrowserMessagePort extends base {
        messagePort             : MessagePort                   = undefined

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<any> {
            this.messagePort.addEventListener('message', this.messageListener = (e : MessageEvent) => {
                this.port.receiveEnvelop(this.messageToEnvelop(e.data))
            })

            this.messagePort.start()
        }


        async doDisconnect () : Promise<any> {
            this.messagePort.removeEventListener('message', this.messageListener)

            this.messageListener    = undefined

            this.messagePort.close()
        }


        sendMessage (message : any) {
            this.messagePort.postMessage(message)
        }
    }
){}
