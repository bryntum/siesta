import ws from 'ws'
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { isString } from "../../util/Typeguards.js"

//---------------------------------------------------------------------------------------------------------------------
// to no confuse `ws` as namespace
type WebSocket = ws

//---------------------------------------------------------------------------------------------------------------------
export class ServerNodeWebSocket extends Mixin(
    [],
    (base : ClassUnion) =>

    class ServerNodeWebSocket extends base {
        wsPort                  : number        = 0

        wsServer                : ws.Server     = undefined

        onConnectionHook        : Hook<[ this, WebSocket ]>     = new Hook()
        onErrorHook             : Hook<[ this, Error ]>         = new Hook()


        startWebSocketServer () : Promise<any> {
            return new Promise<void>((resolve, reject) => {
                const wsServer    = this.wsServer = new ws.Server({
                    clientTracking      : true,
                    port                : this.wsPort
                }, () => {
                    const address       = wsServer.address()

                    if (!isString(address)) this.wsPort = address.port

                    resolve()
                })

                wsServer.on('connection', socket => this.onConnection(socket))
                wsServer.on('error', error => this.onError(error) )

                // wsServer.on('headers', (headers, request) => console.log("HEADERS: ", headers, request));
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
                        this.wsServer = null

                        resolve()
                    })
                else
                    resolve()
            })
        }
    }
){}
