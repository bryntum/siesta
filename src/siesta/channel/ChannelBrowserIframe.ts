import { Base } from "../../class/Base.js"
import { AnyFunction, ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaBrowserMessagePort } from "../../port/MediaBrowserMessagePort.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelBrowserIframe extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelBrowserIframe extends base {
            parentMedia             : MediaBrowserMessagePort           = undefined
            parentMediaClass        : typeof MediaBrowserMessagePort    = MediaBrowserMessagePort


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
                await this.awaitDomReady()

                //-----------------------------
                const iframe        = this.createIframe()

                let listener : AnyFunction

                await new Promise(resolve => {
                    iframe.addEventListener('load', listener = resolve)

                    this.addIframeToDocument(iframe)
                })

                iframe.removeEventListener('load', listener)

                //-----------------------------
                const messageChannel        = new MessageChannel()

                const parentMedia           = this.parentMedia = new this.parentMediaClass()
                parentMedia.messagePort     = messageChannel.port1

                const parentPort            = this.parentPort = new this.parentPortClass
                parentPort.media            = parentMedia

                //-----------------------------
                const seed = async function (url, symbol) {
                    const mod       = await import(url)

                    let listener

                    window.addEventListener('message', listener = event => {
                        if (event.data === '__SIESTA_INIT_CONTEXT__' && event.ports.length > 0) {
                            window.removeEventListener('message', listener)

                            const channel = new mod[ symbol ]

                            channel.media = event.ports[ 0 ]

                            channel.connect()
                        }
                    })
                }

                // for some reason TypeScript does not have `eval` on `Window`
                const page                  = iframe.contentWindow as Window & { eval : (string) => any }

                try {
                    await page.eval(`(${ seed.toString() })("${ this.childPortClassUrl }", "${ this.childPortClassSymbol }")`)
                } catch (e) {
                    // exception here probably means iframe is cross-domain
                    // TODO in such case it is supposed to opt-in somehow for communicating with test suite
                    debugger
                }

                page.postMessage('__SIESTA_INIT_CONTEXT__', '*', [ messageChannel.port2 ])

                await parentPort.connect()
            }
        }

        return ChannelBrowserIframe
    }
) {}
