import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { EnvelopCall, EnvelopResult, Port } from "../port/Port.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Media extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Media extends base {
        port            : Port      = undefined


        async doConnect () : Promise<any> {
            throw "Abstract method `doConnect`"
        }


        async doDisconnect () : Promise<any> {
            throw "Abstract method `doDisconnect`"
        }


        messageToEnvelop (message : unknown) : EnvelopCall | EnvelopResult | undefined {
            throw "Abstract method `messageToEnvelop`"
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
            throw "Abstract method `envelopToMessage`"
        }


        sendMessage (message : unknown) {
            throw "Abstract method `sendMessage`"
        }


        sendEnvelop (envelop : EnvelopCall | EnvelopResult) {
            this.sendMessage(this.envelopToMessage(envelop))
        }


        receiveMessage (message : any) {
            this.port.receiveEnvelop(this.messageToEnvelop(message))
        }
    }
) {}
