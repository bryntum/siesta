import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ChannelSerializablePlain } from "./ChannelSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelSameContext extends Mixin(
    [ ChannelSerializablePlain ],
    (base : ClassUnion<typeof ChannelSerializablePlain>) =>

    class ChannelSameContext extends base {
        media           : ChannelSameContext


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

