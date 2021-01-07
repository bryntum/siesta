import { ClassUnion, Mixin } from "../class/Mixin.js"
import { reviver } from "../serializable/Serializable.js"
import { EnvelopCall, EnvelopResult, Media } from "./Port.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaSerializableJSON extends Mixin(
    [ Media ],
    (base : ClassUnion<typeof Media>) =>

    class MediaSerializableJSON extends base {

        messageToEnvelop (message : string) : EnvelopCall | EnvelopResult | undefined {
            const obj : any      = JSON.parse(message, reviver)

            if (obj.inResponseOf !== undefined)
                return EnvelopResult.new(obj)
            else
                return EnvelopCall.new(obj)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : string {
            return JSON.stringify(envelop)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class MediaSerializablePlain extends Mixin(
    [ Media ],
    (base : ClassUnion<typeof Media>) =>

    class MediaSerializablePlain extends base {

        messageToEnvelop (message : any) : EnvelopCall | EnvelopResult | undefined {
            if (message.inResponseOf !== undefined)
                return EnvelopResult.maybeNew(message)
            else
                return EnvelopCall.maybeNew(message)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
            return envelop
        }
    }
){}
