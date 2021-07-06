import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaBrowserMessagePortParent } from "../../rpc/media/MediaBrowserMessagePort.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { Context, seedChildPort } from "./Context.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextBrowserIframe extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextBrowserIframe extends base {

        iframe                          : HTMLIFrameElement      = undefined

        parentMediaClass                : typeof MediaBrowserMessagePortParent         = MediaBrowserMessagePortParent

        relativeChildMediaModuleUrl     : string    = 'src/rpc/media/MediaBrowserMessagePort.js'
        relativeChildMediaClassSymbol   : string    = 'MediaBrowserMessagePortChild'


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // for some reason TypeScript does not have `eval` on `Window`
            const page              = this.iframe.contentWindow as Window & { eval : (string) => any }

            // TODO detect cross-origin iframe and throw some meaningful error

            const res               = await page.eval(`(${ func.toString() })(...${ JSON.stringify(args) })`)

            return res
        }


        async destroy () {
            this.iframe.remove()

            await super.destroy()
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            const messageChannel        = new MessageChannel()

            const parentMedia           = new this.parentMediaClass()
            parentMedia.messagePort     = messageChannel.port1
            parentMedia.iframe          = this.iframe

            parentPort.media            = parentMedia
            parentPort.handshakeType    = 'parent_first'


            const seed = (seedChildPortSource : string) => {
                let listener

                window.addEventListener('message', listener = event => {
                    const data      = event.data || {}

                    if (data.__SIESTA_INIT_CONTEXT__ && event.ports.length > 0) {
                        window.removeEventListener('message', listener)

                        Object.assign(data.seedChildPortArguments[ 5 ], { messagePort : event.ports[ 0 ] })

                        eval(`(${ seedChildPortSource })`)(...data.seedChildPortArguments)
                    }
                })
            }

            await this.evaluateBasic(seed, seedChildPort.toString())

            this.iframe.contentWindow.postMessage({
                __SIESTA_INIT_CONTEXT__                 : true,
                seedChildPortArguments                  : [
                    relativeChildPortModuleUrl,
                    relativeChildPortClassSymbol,
                    this.relativeChildMediaModuleUrl,
                    this.relativeChildMediaClassSymbol,
                    { handshakeType : 'parent_first' },
                    {}
                ]
            }, '*', [ messageChannel.port2 ])

            await parentPort.connect()
        }
    }
) {}
