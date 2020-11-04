import { Base } from "../class/Base.js"
import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { delay, MIN_SMI } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export type EnvelopId   = number

let ENVELOP_COUNTER         : EnvelopId = 0

//---------------------------------------------------------------------------------------------------------------------
export class Message {
    requiresResult      : boolean   = true
}

//---------------------------------------------------------------------------------------------------------------------
export class EnvelopCall {
    id                  : EnvelopId                     = ENVELOP_COUNTER++

    payload             : [ string, ...unknown[] ]      = undefined
}

export class EnvelopResult {
    id                  : EnvelopId     = MIN_SMI

    inResponseOf        : EnvelopId     = MIN_SMI
    isRejection         : boolean       = false

    payload             : unknown       = undefined
}

//---------------------------------------------------------------------------------------------------------------------
const ensureMessagesStorage = (target : Channel) => {
    if (!target.hasOwnProperty('localMessages')) {
        target.localMessages    = Object.create(target.localMessages || null)
        target.remoteMessages   = Object.create(target.remoteMessages || null)
    }

    return target
}


export const remote = () : PropertyDecorator => {

    return function (target : Channel, propertyKey : string) : void {
        const { remoteMessages } = ensureMessagesStorage(target)

        remoteMessages[ propertyKey ] = true

        Object.defineProperty(target, propertyKey, {

            value   : function (this : Channel) : any {
                return this.sendMessage()
            }
        })
    }
}

export const local = function () : MethodDecorator {

    return function (target : Channel, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
        const { localMessages } = ensureMessagesStorage(target)

        localMessages[ propertyKey ] = true

        Object.defineProperty(target, propertyKey, {

            value   : function (this : Channel) : any {
                // return this.receive
            }
        })
    }
}


export type Messages    = { remote : Set<string>, local : Set<string> }


//---------------------------------------------------------------------------------------------------------------------
export class Channel extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Channel extends base {
        media                   : unknown       = undefined

        localMessages           : object
        remoteMessages          : object

        maxConnectionAttempts   : number        = Number.MAX_SAFE_INTEGER
        connectionTimeout       : number        = 10000
        connectionInterval      : number        = 500

        // awaitingResponses       : Map<EnvelopId, [ Function, Function, Envelop, any ]> = new Map()


        async doConnect (media : this[ 'media' ]) : Promise<any> {
            throw "Abstract method `doConnect`"
        }


        async connect (media : this[ 'media' ]) : Promise<any> {
            if (this.media !== undefined) throw new Error("Already connected")

            let start                   = Date.now()
            let connectionAttempts      = 0

            do {
                try {
                    this.doConnect(media)

                    this.media  = media

                    return
                } catch (e) {
                    await delay(this.connectionInterval)
                }

            } while ( Date.now() - start < this.connectionTimeout && connectionAttempts < this.maxConnectionAttempts)

            throw new Error("Connection failed")
        }


        async doDisconnect () : Promise<any> {
            throw "Abstract method `doDisconnect`"
        }


        async disconnect () : Promise<any> {
            this.doDisconnect()

            this.media      = undefined
        }


        async doSendMessage () : Promise<any> {
            throw "Abstract method `doConnect`"
        }


        async doReceiveMessage () : Promise<any> {
            throw "Abstract method `doConnect`"
        }


        async sendMessage () : Promise<any> {
            throw "Abstract method `doConnect`"
        }

    }
){}

