import { ChildProcess, Serializable } from "child_process"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSerializableJSON } from "./MediaSerializable.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class MediaNodeIpcParent extends Mixin(
    [ MediaSerializableJSON ],
    (base : ClassUnion<typeof MediaSerializableJSON>) =>

    class MediaNodeIpcParent extends base {
        childProcess            : ChildProcess                  = undefined

        messageListener         : (...args : any[]) => void     = undefined
        exitListener            : (...args : any[]) => void     = undefined


        async doConnect () : Promise<any> {
            this.childProcess.addListener('message', this.messageListener = message => {
                this.receiveMessage(message)
            })

            this.childProcess.addListener('exit', this.exitListener = () => {
                this.port.logger && this.port.logger.debug('NodeJS child process exit')

                this.port.disconnect()
            })
        }


        async doDisconnect () : Promise<any> {
            this.childProcess.removeListener('message', this.messageListener)
            this.childProcess.removeListener('exit', this.exitListener)

            this.messageListener    = undefined
            this.exitListener       = undefined

            if (this.childProcess.connected) this.childProcess.disconnect()
        }


        sendMessage (message : Serializable) {
            this.childProcess.send(message)
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class MediaNodeIpcChild extends Mixin(
    [ MediaSerializableJSON ],
    (base : ClassUnion<typeof MediaSerializableJSON>) =>

    class MediaNodeIpcChild extends base {
        process                 : NodeJS.Process                = process

        messageListener         : (...args : any[]) => void     = undefined


        async doConnect () : Promise<any> {
            this.process.addListener('message', this.messageListener = message => this.receiveMessage(message))
        }


        async doDisconnect () : Promise<any> {
            this.messageListener && this.process.removeListener('message', this.messageListener)

            this.messageListener    = undefined

            this.process.disconnect()
        }


        sendMessage (message : Serializable) {
            this.process.send(message)
        }
    }
){}
