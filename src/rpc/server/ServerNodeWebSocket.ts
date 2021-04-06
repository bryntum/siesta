// import ws from 'ws'
// import { Base } from "../../class/Base.js"
// import { AnyConstructor } from "../../class/Mixin.js"
// import { MediaNodeWebSocketParent } from "../media/MediaNodeWebSocketParent.js"
//
//
// export class ConnectionServer extends Base {
//     serverClass             : AnyConstructor<MediaNodeWebSocketParent>
//     serverConfig            : Partial<MediaNodeWebSocketParent>
//
//     port                    : number = 0
//
//     connectionServerWS      : any
//
//
//     async start () : Promise<any> {
//         const connectionServerWS    = this.connectionServerWS = new ws.Server({
//             clientTracking      : true,
//
//             port                : this.port
//         }, () => {
//             this.port       = this.connectionServerWS.address().port
//
//             resolve()
//         })
//
//         connectionServerWS.on('connection', (wsClient : ws) => {
//             const cls       = this.serverClass
//
//             const config    = Object.assign({
//                 socket      : wsClient,
//                 logLevel    : this.logLevel
//             }, this.serverConfig || {})
//
//             const webSocketServer = new cls(config)
//
//             webSocketServer.connect()
//         })
//
//         connectionServerWS.on('error', () => { this.stop() } )
//
//         await new Promise(resolve => connectionServerWS.on('listening', resolve))
//
//         // wsServer.on('error', (e) => console.log("ERROR: ", e));
//         // wsServer.on('headers', (headers, request) => console.log("HEADERS: ", headers, request));
//     }
//
//
//     async stop () : Promise<any> {
//         return new Promise((resolve, reject) => {
//             if (this.connectionServerWS)
//                 this.connectionServerWS.close(() => {
//                     this.connectionServerWS = null
//
//                     resolve()
//                 })
//             else
//                 resolve()
//         })
//     }
// }
