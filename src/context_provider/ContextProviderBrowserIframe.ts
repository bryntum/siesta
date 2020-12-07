import { ChannelBrowserMessagePort } from "../channel/ChannelBrowserMessagePort.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContextRemote } from "../context/ExecutionContextRemote.js"
import { ContextProvider } from "./ContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderBrowserIframe extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderBrowserIframe extends base {
        childChannelClassUrl         : string            = import.meta.url
            .replace(/^file:\\\\/, '')
            .replace(/context_provider\/ContextProviderBrowserIframe.js$/, 'context/ExecutionContextRemoteNodeIpc.js')

        childChannelClassSymbol      : string            = 'ExecutionContextRemoteNodeIpcChild'


        parentChannelClass : typeof ChannelBrowserMessagePort   = ChannelBrowserMessagePort

        iframeSrc       : string            = ''


        async setup () {
            if (document.readyState === 'complete') return

            return new Promise<void>(resolve => {
                let listener

                window.addEventListener('load', listener = () => {
                    window.removeEventListener('load', listener)
                    resolve()
                })
            })
        }


        async destroy () {
            // do nothing
        }


        async createContext () : Promise<ExecutionContextRemote> {
            const iframe        = document.createElement('iframe')

            iframe.src          = this.iframeSrc

            await new Promise(resolve => {
                document.body.appendChild(iframe)

                iframe.addEventListener('load', resolve)
            })

            const messageChannel        = new MessageChannel()

            const context       = this.parentChannelClass.new({ media : messageChannel.port1 })

            iframe.contentWindow.postMessage(null, '*', [ messageChannel.port2 ])

            return context
        }
    }
) {}

