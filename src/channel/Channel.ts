import { delay, MIN_SMI } from "../util/Helpers.js"

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


export const remote = () : PropertyDecorator => {

    return function (target : object, fieldName : string) : void {
    }
}


// export const remote = function () : MethodDecorator {
//
//     return function (target : object, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
//     }
// }


export const local = function () : MethodDecorator {

    return function (target : object, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class Channel<Media, Message> {
    maxConnectionAttempts   : number        = Number.MAX_SAFE_INTEGER
    connectionTimeout       : number        = 10000
    connectionInterval      : number        = 500


    async doConnect (media : Media) : Promise<any> {
        throw "Abstract method `doConnect`"
    }


    async connect (media : Media) : Promise<any> {
        let start                   = Date.now()
        let connectionAttempts      = 0

        do {
            try {
                this.doConnect(media)

                return
            } catch (e) {
                await delay(this.connectionInterval)
            }

        } while ( Date.now() - start < this.connectionTimeout && connectionAttempts < this.maxConnectionAttempts)

        throw new Error("Connection failed")
    }


    async doDisconnect (media : Media) : Promise<any> {
        throw "Abstract method `doDisconnect`"
    }


    async disconnect (media : Media) : Promise<any> {

    }


    async sendMessage (message : Message) : Promise<any> {

    }
}
