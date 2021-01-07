// import { ClassUnion, Mixin } from "../class/Mixin.js"
// import { MediaSerializablePlain } from "./MediaSerializable.js"
//
// //---------------------------------------------------------------------------------------------------------------------
// export class PortSameContext extends Mixin(
//     [ MediaSerializablePlain ],
//     (base : ClassUnion<typeof MediaSerializablePlain>) =>
//
//     class PortSameContext extends base {
//         media           : PortSameContext
//
//
//         async doConnect () : Promise<any> {
//             // do nothing
//         }
//
//
//         async doDisconnect () : Promise<any> {
//             // do nothing
//         }
//
//
//         sendMessage (message : unknown) {
//             this.media.receiveEnvelop(message)
//         }
//     }
// ){}
//
