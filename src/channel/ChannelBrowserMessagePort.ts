import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { TestRecipeBrowserIframeChild } from "../siesta/test/recipe/TestRecipeBrowserIframe.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelBrowserMessagePort extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) =>

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




// window.addEventListener('message', event => {
//     if (event.data === 'SIESTA_INIT_CONTEXT' && event.ports.length > 0) {
//         // TODO need to import/create specific "channel" instance
//         const channel = TestRecipeBrowserIframeChild.new({ media : event.ports[ 0 ] })
//
//         channel.connect()
//     }
// })
