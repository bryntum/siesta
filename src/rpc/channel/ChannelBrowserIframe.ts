import { Base } from "../../class/Base.js"
import { AnyFunction, ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaBrowserMessagePortChild, MediaBrowserMessagePortParent } from "../media/MediaBrowserMessagePort.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelBrowserIframe extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelBrowserIframe extends base {
            childMediaClassUrl      : string                = import.meta.url
                .replace(/channel\/ChannelBrowserIframe.js$/, 'media/MediaBrowserMessagePort.js')
            childMediaClassSymbol   : string                = 'MediaBrowserMessagePortChild'

            parentMedia             : MediaBrowserMessagePortParent           = undefined
            parentMediaClass        : typeof MediaBrowserMessagePortParent    = MediaBrowserMessagePortParent


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
                parentMedia.iframe          = iframe

                const parentPort            = this.parentPort = new this.parentPortClass
                parentPort.media            = parentMedia

                //-----------------------------
                const seed = async function (
                    modulePortUrl : string, portClassSymbol : string,
                    moduleMediaUrl : string, mediaClassSymbol : string
                ) {
                    const [ modulePort, moduleMedia ]   = await Promise.all([ import(modulePortUrl), import(moduleMediaUrl) ])

                    let listener

                    window.addEventListener('message', listener = event => {
                        if (event.data === '__SIESTA_INIT_CONTEXT__' && event.ports.length > 0) {
                            window.removeEventListener('message', listener)

                            const media     = new moduleMedia[ mediaClassSymbol ]
                            const port      = new modulePort[ portClassSymbol ]

                            media.messagePort   = event.ports[ 0 ]

                            port.media      = media

                            port.connect()
                        }
                    })
                }

                // for some reason TypeScript does not have `eval` on `Window`
                const page                  = iframe.contentWindow as Window & { eval : (string) => any }

                try {
                    await page.eval(`
                        (${ seed.toString() })(
                            "${ this.childPortClassUrl }", 
                            "${ this.childPortClassSymbol }", 
                            "${ this.childMediaClassUrl }", 
                            "${ this.childMediaClassSymbol }"
                        )
                    `)
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
