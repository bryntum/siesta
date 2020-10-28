import { MIN_SMI } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export type EnvelopId   = number

let ENVELOP_COUNTER         : EnvelopId = 0

export const getEnvelopId = () : EnvelopId => ENVELOP_COUNTER++

//---------------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------------------
export type EnvelopType = string

export interface Envelop<Payload = any> {
    id                  : EnvelopId

    inResponseOf?       : EnvelopId
    type?               : EnvelopType
    isRejection?        : boolean

    payload             : Payload
}





//---------------------------------------------------------------------------------------------------------------------
export class Channel<Media, Message> {
    connectionTimeout       : ReturnType<typeof setTimeout>     = undefined
    connectionInterval      : number                            = 1000


    async doConnect (media : Media) : Promise<any> {
        throw "Abstract method `doConnect`"
    }


    async connect (media : Media) : Promise<any> {
        let start   = new Date().getTime()


        return new Promise((resolve, reject) => {

            const connectionAttempt = () => {
                this.doConnect(media).then(
                    resolve,
                    reason => {
                        if (new Date().getTime() - start > (this.connectionTimeout || 3000))
                            reject(reason)
                        else
                            setTimeout(connectionAttempt, this.connectionInterval)
                    }
                )
            }

            connectionAttempt()
        })
    }


    async doDisconnect (media : Media) : Promise<any> {
        throw "Abstract method `doDisconnect`"
    }


    async disconnect (media : Media) : Promise<any> {

    }


    async sendMessage (message : Message) : Promise<any> {

    }
}
