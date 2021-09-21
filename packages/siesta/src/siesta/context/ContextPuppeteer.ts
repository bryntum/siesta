import puppeteer from "puppeteer"
import ws from 'ws'
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaNodeWebSocketParent } from "../../rpc/media/MediaNodeWebSocketParent.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { ServerNodeWebSocket } from "../../rpc/server/ServerNodeWebSocket.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { ContextBrowser } from "./ContextBrowser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ContextPuppeteer extends Mixin(
    [ ContextBrowser, ServerNodeWebSocket ],
    (base : ClassUnion<typeof ContextBrowser, typeof ServerNodeWebSocket>) =>

    class ContextPuppeteer extends base {

        parentMediaClass        : typeof MediaNodeWebSocketParent       = MediaNodeWebSocketParent

        relativeChildMediaModuleUrl     : string    = 'src/rpc/media/MediaBrowserWebSocketChild.js'
        relativeChildMediaClassSymbol   : string    = 'MediaBrowserWebSocketChild'

        page            : puppeteer.Page        = undefined

        maintainsBrowser    : boolean           = false


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // we are not going to bother with fixing the type of Puppeteer's `evaluate` -
            // for some reason it requires at least 1 argument for the function
            // @ts-ignore
            return this.page.evaluate(func, ...args)
        }


        async destroy () {
            await this.stopWebSocketServer()

            const browser       = this.page.browser()

            await this.page.close()

            if (this.maintainsBrowser) await browser.close()

            await super.destroy()
        }


        async navigate (url : string) {
            await this.page.goto(url)
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            await Promise.all([
                this.startWebSocketServer(),
                // this.navigate(this.provider.launcher.projectData.siestaPackageRootUrl + 'resources/landing.html')
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
