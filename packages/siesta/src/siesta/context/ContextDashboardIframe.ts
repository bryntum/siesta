import ws from "ws"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaNodeWebSocketParent } from "../../rpc/media/MediaNodeWebSocketParent.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { ServerNodeWebSocket } from "../../rpc/server/ServerNodeWebSocket.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { LUID } from "../common/LUID.js"
import { ContextBrowser } from "./ContextBrowser.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextDashboardIframe extends Mixin(
    [ ContextBrowser, ServerNodeWebSocket ],
    (base : ClassUnion<typeof ContextBrowser, typeof ServerNodeWebSocket>) =>

    class ContextDashboardIframe extends base {

        parentMediaClass                : typeof MediaNodeWebSocketParent = MediaNodeWebSocketParent

        relativeChildMediaModuleUrl     : string                = 'src/rpc/media/MediaBrowserWebSocketChild.js'
        relativeChildMediaClassSymbol   : string                = 'MediaBrowserWebSocketChild'

        contextId                       : LUID                  = undefined


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            const connector             = this.provider.launcher.dashboardConnector

            return connector.iframeContextEvaluateBasic(this.contextId, func, ...args)
        }


        async navigate (url : string) {
            // const connector             = this.provider.launcher.dashboardConnector
            //
            // return connector.iframeContextNavigate(this.contextId, url)
        }


        async destroy () {
            const connector             = this.provider.launcher.dashboardConnector

            await connector.iframeContextDestroy(this.contextId)

            await super.destroy()
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            await Promise.all([
                this.startWebSocketServer(),
            ])

            const parentMedia           = new this.parentMediaClass()

            parentPort.media            = parentMedia
            parentPort.handshakeType    = 'parent_first'

            const awaitConnection       = new Promise<ws>(resolve => this.onConnectionHook.once((self, socket) => resolve(socket)))

            await this.seedChildPort(
                relativeChildPortModuleUrl,
                relativeChildPortClassSymbol,
                { handshakeType : 'parent_first' },
                { wsHost : '127.0.0.1', wsPort : this.wsPort }
            )

            parentMedia.socket          = await awaitConnection

            await parentPort.connect()
        }
    }
) {}
