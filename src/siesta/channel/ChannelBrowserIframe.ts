import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { PortBrowserMessagePort } from "../../port/PortBrowserMessagePort.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelBrowserIframe extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelBrowserIframe extends base {
            parentPort              : PortBrowserMessagePort     = undefined

            parentPortClass         : typeof PortBrowserMessagePort  = PortBrowserMessagePort


            async awaitDomReady () {
                if (document.readyState === 'complete') return

                return new Promise<void>(resolve => {
                    let listener

                    window.addEventListener('load', listener = () => {
                        window.removeEventListener('load', listener)
                        resolve()
                    })
                })
            }


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
                const iframe        = this.createIframe()

                await new Promise(resolve => {
                    iframe.addEventListener('load', resolve)

                    this.addIframeToDocument(iframe)
                })

                const messageChannel        = new MessageChannel()

                const parentPort            = new this.parentPortClass

                parentPort.media            = messageChannel.port1

                // for some reason TypeScript does not have `eval` on `Window`
                const page                  = iframe.contentWindow as Window & { eval : (string) => any }

                const seed = async function (url, symbol) {
                    const mod       = await import(url)

                    let listener

                    window.addEventListener('message', listener = event => {
                        if (event.data === 'SIESTA_INIT_CONTEXT' && event.ports.length > 0) {
                            window.removeEventListener('message', listener)

                            const channel = new mod[ symbol ]

                            channel.media = event.ports[ 0 ]

                            channel.connect()
                        }
                    })
                }

                try {
                    await page.eval(`(${ seed.toString() })("${ this.childPortClassUrl }", "${ this.childPortClassSymbol }")`)
                } catch (e) {
                    // exception here probably means iframe is cross-domain
                    // TODO in such case it is supposed to opt-in somehow for communicating with test suite
                    debugger
                }

                page.postMessage('SIESTA_INIT_CONTEXT', '*', [ messageChannel.port2 ])

                await parentPort.connect()

                this.parentPort     = parentPort
            }
        }

        return ChannelBrowserIframe
    }
) {}
