import { ClassUnion, Mixin } from "../class/Mixin.js"
import { PortSerializablePlain } from "./PortSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class PortSameContext extends Mixin(
    [ PortSerializablePlain ],
    (base : ClassUnion<typeof PortSerializablePlain>) =>

    class PortSameContext extends base {
        media           : PortSameContext


        async doConnect () : Promise<any> {
            // do nothing
        }


        async doDisconnect () : Promise<any> {
            // do nothing
        }


        sendMessage (message : unknown) {
            this.media.receiveMessage(message)
        }
    }
){}

