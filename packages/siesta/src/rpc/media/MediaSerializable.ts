import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { parse, SerializationScope, stringify } from "../../serializable/Serializable.js"
import { EnvelopCall, EnvelopResult } from "../port/Port.js"
import { Media } from "./Media.js"

//---------------------------------------------------------------------------------------------------------------------
export class MediaSerializableJSON extends Mixin(
    [ Media ],
    (base : ClassUnion<typeof Media>) =>

    class MediaSerializableJSON extends base {

        messageToEnvelop (message : string) : EnvelopCall | EnvelopResult | undefined {
            const obj : any      = parse(message)

            if (obj.inResponseOf !== undefined)
                return EnvelopResult.new(obj)
            else
                return EnvelopCall.new(obj)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : string {
            return stringify(envelop)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
// TODO this serializer is not ready for production yet
// it can mix the local and remote ids, providing very unexpected results
// need to either split local/remote ids in different namespaces,
// or maintain mapping between them
export class MediaSerializableJSONScoped extends Mixin(
    [ Media ],
    (base : ClassUnion<typeof Media>) =>

    class MediaSerializableJSON extends base {
        scope           : SerializationScope        = SerializationScope.new()


        messageToEnvelop (message : string) : EnvelopCall | EnvelopResult | undefined {
            const obj : any      = this.scope.parse(message)

            if (obj.inResponseOf !== undefined)
                return EnvelopResult.new(obj)
            else
                return EnvelopCall.new(obj)
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : string {
            return this.scope.stringify(envelop)
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

