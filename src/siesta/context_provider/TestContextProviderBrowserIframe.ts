import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestLauncherParent } from "../test/channel/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { TestRecipeBrowserIframeChild, TestRecipeBrowserIframeParent } from "../test/recipe/TestRecipeBrowserIframe.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderBrowserIframe extends Mixin(
    [ TestContextProvider ],
    (base : ClassUnion<typeof TestContextProvider>) => {

        class TestContextProviderBrowserIframe extends base {

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
                const childChannelModuleUrl : string        = import.meta.url
                    .replace(/context_provider\/TestContextProviderBrowserIframe.js$/, 'test/recipe/TestRecipeBrowserIframe.js')

                const iframe        = document.createElement('iframe')

                iframe.src          = 'about:blank'
                iframe.style.border = '0'

                await new Promise(resolve => {
                    iframe.addEventListener('load', resolve)

                    document.body.appendChild(iframe)
                })

                const messageChannel        = new MessageChannel()

                const context               = TestRecipeBrowserIframeParent.new({ media : messageChannel.port1 })

                // for some reason TypeScript does not have `eval` on `Window`
                const page                  = iframe.contentWindow as Window & { eval : (string) => any }

                const seed = async function (url) {
                    const mod       = await import(url)

                    let listener

                    window.addEventListener('message', listener = event => {
                        if (event.data === 'SIESTA_INIT_CONTEXT' && event.ports.length > 0) {
                            window.removeEventListener('message', listener)

                            const channel = mod.TestRecipeBrowserIframeChild.new({ media : event.ports[ 0 ] })

                            channel.connect()
                        }
                    })
                }

                try {
                    await page.eval(`(${ seed.toString() })("${ childChannelModuleUrl }")`)
                } catch (e) {
                    // exception here probably means iframe is cross-domain
                    // TODO in such case it is supposed to opt-in somehow for communicating with test suite
                    debugger
                }

                page.postMessage('SIESTA_INIT_CONTEXT', '*', [ messageChannel.port2 ])

                await context.connect()

                return context
            }
        }

        return TestContextProviderBrowserIframe
    }
) {}
