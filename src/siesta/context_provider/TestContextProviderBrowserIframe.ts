import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestLauncherParent } from "../test/channel/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { TestRecipeBrowserIframeParent } from "../test/recipe/TestRecipeBrowserIframe.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderBrowserIframe extends Mixin(
    [ TestContextProvider ],
    (base : ClassUnion<typeof TestContextProvider>) => {

        class TestContextProviderBrowserIframe extends base {
            childChannelClassUrl         : string            = import.meta.url
                .replace(/^file:/, '')
                .replace(/context_provider\/TestContextProviderBrowserIframe.js$/, 'test/context/TestContextNodeIpc.js')

            childChannelClassSymbol      : string            = 'TestContextNodeIpcChild'



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


            async createTestContext (desc : TestDescriptor) : Promise<TestLauncherParent> {
                const iframe        = document.createElement('iframe')

                iframe.src          = desc.url

                await new Promise(resolve => {
                    document.body.appendChild(iframe)

                    iframe.addEventListener('load', resolve)
                })

                const messageChannel        = new MessageChannel()

                const context       = TestRecipeBrowserIframeParent.new({ media : messageChannel.port1 })

                iframe.contentWindow.postMessage('SIESTA_INIT_CONTEXT', '*', [ messageChannel.port2 ])

                return context
            }

        }

        return TestContextProviderBrowserIframe
    }
) {}
