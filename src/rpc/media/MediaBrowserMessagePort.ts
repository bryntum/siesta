import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSONScoped } from "./MediaSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaBrowserMessagePortChild extends Mixin(
    [ MediaSerializableJSONScoped ],
    (base : ClassUnion<typeof MediaSerializableJSONScoped>) =>

    class MediaBrowserMessagePortChild extends base {
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


//---------------------------------------------------------------------------------------------------------------------
export class MediaBrowserMessagePortParent extends Mixin(
    [ MediaBrowserMessagePortChild ],
    (base : ClassUnion<typeof MediaBrowserMessagePortChild>) =>

    class MediaBrowserMessagePortParent extends base {
        iframe          : HTMLIFrameElement     = undefined


        async doDisconnect () : Promise<any> {
            super.doDisconnect()

            this.iframe.remove()
        }
    }
){}
