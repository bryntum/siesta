import ws from 'ws'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from "url"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { isString } from "../../util/Typeguards.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// to no confuse `ws` as namespace
type WebSocket = ws

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ServerNodeWebSocket extends Mixin(
    [],
    (base : ClassUnion) =>

    class ServerNodeWebSocket extends base {
        // request any free port
        wsPort                  : number        = 0

        wsServer                : ws.Server     = undefined
        httpsServer             : https.Server  = undefined

        onConnectionHook        : Hook<[ this, WebSocket ]>     = new Hook()
        onErrorHook             : Hook<[ this, Error ]>         = new Hook()


        startWebSocketServer () : Promise<number> {
            const current   = path.dirname(fileURLToPath(import.meta.url))

            return new Promise((resolve, reject) => {
                const server = this.httpsServer = https.createServer({
                    cert    : fs.readFileSync(
                        // bundle-proof relative urls
                        fileURLToPath(new URL('../../../resources/cert/certificate.pem', import.meta.url).href)
                    ),
                    key     : fs.readFileSync(
                        // bundle-proof relative urls
                        fileURLToPath(new URL('../../../resources/cert/key.pem', import.meta.url).href)
                    )
                })

                const wsServer    = this.wsServer = new ws.Server({
                    server,
                    clientTracking      : true
                })

                wsServer.on('listening', () => {
                    const address       = wsServer.address()

                    // save the assigned port
                    if (!isString(address)) this.wsPort = address.port

                    resolve(this.wsPort)
                })

                wsServer.on('connection', socket => this.onConnection(socket))
                wsServer.on('error', error => this.onError(error) )

                server.listen(this.wsPort)
            })
        }


        onConnection (socket : WebSocket) {
            this.onConnectionHook.trigger(this, socket)
        }


        onError (error : Error) {
            this.onErrorHook.trigger(this, error)
        }


        stopWebSocketServer () : Promise<any> {
            return new Promise<void>((resolve, reject) => {
                if (this.wsServer)
                    this.wsServer.close(() => {
                        this.httpsServer.close(() => {
                            this.httpsServer    = null
                            this.wsServer       = null

                            resolve()
                        })
                    })
                else
                    resolve()
            })
        }
    }
){}
