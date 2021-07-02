import { AnyFunction, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { awaitDomReady } from "../../../util/Helpers.js"
import { ContextBrowserIframe } from "../ContextBrowserIframe.js"
import { ContextProvider } from "./ContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderBrowserIframe extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderBrowserIframe extends base {
        local                   : boolean           = true

        contextClass            : typeof ContextBrowserIframe    = ContextBrowserIframe


        createIframe () : HTMLIFrameElement {
            const iframe        = document.createElement('iframe')

            iframe.src          = 'about:blank'
            iframe.style.border = '0'

            return iframe
        }


        addIframeToDocument (iframe : HTMLIFrameElement) {
            document.body.appendChild(iframe)
        }


        async setup () {
            await awaitDomReady()
        }


        async doCreateContext () : Promise<InstanceType<this[ 'contextClass' ]>> {
            const iframe        = this.createIframe()

            let listener : AnyFunction

            await new Promise(resolve => {
                iframe.addEventListener('load', listener = resolve)

                this.addIframeToDocument(iframe)
            })

            iframe.removeEventListener('load', listener)

            return this.contextClass.new({ iframe }) as InstanceType<this[ 'contextClass' ]>
        }

        static providerName : string = 'browseriframe'
    }
) {}
