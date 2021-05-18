import playwright from "playwright"
import ws from 'ws'
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaNodeWebSocketParent } from "../../rpc/media/MediaNodeWebSocketParent.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { ServerNodeWebSocket } from "../../rpc/server/ServerNodeWebSocket.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { ContextBrowser } from "./ContextBrowser.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextPlaywright extends Mixin(
    [ ContextBrowser, ServerNodeWebSocket ],
    (base : ClassUnion<typeof ContextBrowser, typeof ServerNodeWebSocket>) =>

    class ContextPlaywright extends base {

        parentMediaClass        : typeof MediaNodeWebSocketParent       = MediaNodeWebSocketParent

        relativeChildMediaModuleUrl     : string    = 'src/rpc/media/MediaBrowserWebSocketChild.js'
        relativeChildMediaClassSymbol   : string    = 'MediaBrowserWebSocketChild'

        page            : playwright.Page        = undefined

        maintainsBrowser    : boolean           = false


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            const wrapper   = globalThis.eval(`(args) => (${ func.toString() })(...args)`)


            // @ts-ignore
            return this.page.evaluate(wrapper, args)
        }


        async destroy () {
            await this.stopWebSocketServer()

            const browser       = this.page.context().browser()

            await this.page.close()

            if (this.maintainsBrowser) await browser.close()

            await super.destroy()
        }


        async navigate (url : string) {
            await this.page.goto(url)
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            await Promise.all([
                await this.startWebSocketServer(),
                await this.navigate(this.provider.launcher.projectData.siestaPackageRootUrl + 'resources/landing.html')
            ])

            const parentMedia           = new this.parentMediaClass()

            parentPort.media            = parentMedia
            parentPort.handshakeType    = 'parent_first'

            const awaitConnection       = new Promise<ws>(resolve => this.onConnectionHook.once((self, socket) => resolve(socket)))

            this.provider.launcher.logger.debug('Context before seed')

            await this.seedChildPort(
                relativeChildPortModuleUrl,
                relativeChildPortClassSymbol,
                { handshakeType : 'parent_first' },
                { wsHost : '127.0.0.1', wsPort : this.wsPort }
            )

            this.provider.launcher.logger.debug('Context after seed')

            parentMedia.socket          = await awaitConnection

            await parentPort.connect()
        }
    }
) {}
