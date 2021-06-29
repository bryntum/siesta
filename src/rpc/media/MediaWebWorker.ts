import { Serializable } from "child_process"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSONScoped } from "./MediaSerializable.js"

//---------------------------------------------------------------------------------------------------------------------
// this type is declared in TS definitions lib, called `webworker`:
// {
//     "compilerOptions" : {
//         "lib"                       : [
//            "webworker"
//         ],
// but it conflicts with the "dom" lib.. can't use both and can't declare
// a lib for specific file

type DedicatedWorkerGlobalScope = any

declare const self : DedicatedWorkerGlobalScope

//---------------------------------------------------------------------------------------------------------------------
export class MediaWebWorkerChild extends Mixin(
    [ MediaSerializableJSONScoped, Base ],
    (base : ClassUnion<typeof MediaSerializableJSONScoped, typeof Base>) =>

    class MediaWebWorkerChild extends base {

        messageListener         : (...args : any[]) => void     = undefined

        workerGlobalScope       : DedicatedWorkerGlobalScope    = self


        async doConnect () : Promise<any> {
            this.workerGlobalScope.addEventListener('message', this.messageListener = (e : MessageEvent) => {
                this.receiveMessage(e.data)
            })
        }


        async doDisconnect () : Promise<any> {
            this.workerGlobalScope.removeEventListener('message', this.messageListener)

            this.messageListener    = undefined

            this.workerGlobalScope.close()
        }


        sendMessage (message : any) {
            this.workerGlobalScope.postMessage(message)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class MediaWebWorkerParent extends Mixin(
    [ MediaSerializableJSONScoped, Base ],
    (base : ClassUnion<typeof MediaSerializableJSONScoped, typeof Base>) =>

    class MediaWebWorkerParent extends base {
        worker                  : Worker                        = undefined

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<any> {
            this.worker.addEventListener('message', this.messageListener = (message : MessageEvent) => {
                this.receiveMessage(message.data)
            })
        }


        async doDisconnect () : Promise<any> {
            this.worker.removeEventListener('message', this.messageListener)

            this.messageListener    = undefined

            this.worker.terminate()
        }


        sendMessage (message : Serializable) {
            this.worker.postMessage(message)
        }
    }
){}
