import { AnyFunction, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { awaitDomReady } from "../../../util/Helpers.js"
import { TestDescriptorBrowser } from "../../test/TestDescriptorBrowser.js"
import { ContextBrowserIframe } from "../ContextBrowserIframe.js"
import { ContextProvider } from "./ContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderBrowserIframe extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderBrowserIframe extends base {
        local                   : boolean           = true

        contextClass            : typeof ContextBrowserIframe    = ContextBrowserIframe


        createIframe (desc? : TestDescriptorBrowser) : [ HTMLDivElement, HTMLIFrameElement ] {
            const wrapper       = document.createElement('div')
            wrapper.className   = 's-iframe-wrapper'

            wrapper.setAttribute('style', 'position: absolute; left:-10000px; top: -10000px;')

            //-------------
            const wrapperInner  = document.createElement('div')
            wrapperInner.className = 's-iframe-wrapper-inner'

            wrapper.appendChild(wrapperInner)

            //-------------
            const iframe        = document.createElement('iframe')

            iframe.src          = 'about:blank'

            iframe.classList.add('s-iframe')

            iframe.style.width  = (desc?.viewportWidth ?? 1024) + 'px'
            iframe.style.height = (desc?.viewportHeight ?? 768) + 'px'
            iframe.style.border = '0'

            wrapperInner.appendChild(iframe)

            return [ wrapper, iframe ]
        }


        async setup () {
            await awaitDomReady()
        }


        async doCreateContext (desc? : TestDescriptorBrowser) : Promise<InstanceType<this[ 'contextClass' ]>> {
            const [ wrapper, iframe ]       = this.createIframe(desc)

            await new Promise(resolve => {
                iframe.addEventListener('load', resolve, { once : true })

                document.body.appendChild(wrapper)
            })

            return this.contextClass.new({ iframe, wrapper }) as InstanceType<this[ 'contextClass' ]>
        }

        static providerName : string = 'browseriframe'
    }
) {}
