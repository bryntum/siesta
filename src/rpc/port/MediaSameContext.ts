import { Serializable } from "child_process"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializablePlain } from "./MediaSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaSameContext extends Mixin(
    [ MediaSerializablePlain ],
    (base : ClassUnion<typeof MediaSerializablePlain>) =>

    class MediaSameContext extends base {
        targetMedia             : MediaSameContext              = undefined


        async doConnect () : Promise<any> {
        }


        async doDisconnect () : Promise<any> {
        }


        sendMessage (message : Serializable) {
            this.targetMedia.receiveMessage(message)
        }
    }
){}
