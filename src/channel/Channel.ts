import { Base } from "../class/Base.js"
import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { Logger } from "../logger/Logger.js"
import { delay, MIN_SMI, SetTimeoutHandler } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export type EnvelopId   = number

let ENVELOP_COUNTER         : EnvelopId = 0

//---------------------------------------------------------------------------------------------------------------------
export class Message extends Base {
    requiresResult      : boolean   = true

    timeout             : number    = 0
}

//---------------------------------------------------------------------------------------------------------------------
export class EnvelopCall extends Base {
    id                  : EnvelopId                     = ENVELOP_COUNTER++

    payload             : [ string, ...unknown[] ]      = undefined
}

export class EnvelopResult extends Base {
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


export const remote = (messageDesc : Partial<Message> = Message.new()) : PropertyDecorator => {

    const message       = Message.fromPlainObject(messageDesc)

    return function (target : Channel, propertyKey : string) : void {
        const { remoteMessages } = ensureMessagesStorage(target)

        remoteMessages[ propertyKey ] = message

        Object.defineProperty(target, propertyKey, {

            value   : function (this : Channel) : Promise<unknown> {
                return this.callRemote(
                    EnvelopCall.new({
                        payload     : [ propertyKey, ...arguments ]
                    }),
                    message
                )
            }
        })
    }
}

export const local = function (message : Partial<Message> = Message.new()) : MethodDecorator {

    return function (target : Channel, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
        const { localMessages } = ensureMessagesStorage(target)

        localMessages[ propertyKey ] = message
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class Channel extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Channel extends base {
        media                   : unknown       = undefined

        localMessages           : object
        remoteMessages          : object

        logger                  : Logger        = undefined

        maxConnectionAttempts   : number        = Number.MAX_SAFE_INTEGER
        connectionTimeout       : number        = 10000
        connectionInterval      : number        = 500

        awaitingResponse        : Map<EnvelopId, [ Function, Function, EnvelopCall, SetTimeoutHandler ]> = new Map()


        async doConnect (media : this[ 'media' ]) : Promise<any> {
            throw "Abstract method `doConnect`"
        }


        async connect (media : this[ 'media' ]) : Promise<any> {
            if (this.media !== undefined) throw new Error("Already connected")

            let start                   = Date.now()
            let connectionAttempts      = 0

            do {
                try {
                    connectionAttempts++

                    this.logger && this.logger.debug(`Connection attempt: ${ connectionAttempts }`)

                    this.doConnect(media)

                    this.media  = media

                    return
                } catch (e) {
                    this.logger && this.logger.debug(`Connection attempt ${ connectionAttempts } failed: ${e}`)

                    await delay(this.connectionInterval)
                }

            } while (Date.now() - start < this.connectionTimeout && connectionAttempts < this.maxConnectionAttempts)

            throw new Error("Connection failed")
        }


        async doDisconnect () : Promise<any> {
            throw "Abstract method `doDisconnect`"
        }


        async disconnect () : Promise<any> {
            this.awaitingResponse.forEach(value => {
                value[ 1 ](new Error("Channel disconnected during the call"))
            })

            this.awaitingResponse.clear()

            await this.doDisconnect()

            this.media      = undefined
        }


        sendMessage (message : unknown) {
            throw "Abstract method `sendMessage`"
        }


        messageToEnvelop (message : unknown) : EnvelopCall | EnvelopResult | undefined {
            throw "Abstract method `messageToEnvelop`"
        }


        envelopToMessage (envelop : EnvelopCall | EnvelopResult) : unknown {
            throw "Abstract method `envelopToMessage`"
        }


        async receiveMessage (message : unknown) {
            const envelop       = this.messageToEnvelop(message)

            if (envelop instanceof EnvelopResult) {
                const inResponseOf  = envelop.inResponseOf
                const handler       = this.awaitingResponse.get(inResponseOf)

                if (!handler) {
                    this.logger && this.logger.debug(`Response for unknown envelop, timeout occurred?\n${ JSON.stringify(envelop) }`)
                } else {
                    this.awaitingResponse.delete(inResponseOf)

                    handler[ envelop.isRejection ? 1 : 0 ](envelop.payload)
                }
            } else {
                const methodName    = envelop.payload[ 0 ]

                if (!this.localMessages[ methodName ]) throw new Error(`No local messages with name: '${ methodName }'`)

                let resultingEnvelop : EnvelopResult

                try {
                    resultingEnvelop = EnvelopResult.new({
                        inResponseOf    : envelop.id,
                        isRejection     : false,
                        payload         : await this[ methodName ].apply(this, envelop.payload.slice(1))
                    })

                } catch (e) {
                    resultingEnvelop = EnvelopResult.new({
                        inResponseOf    : envelop.id,
                        isRejection     : true,
                        payload         : e
                    })
                }

                this.sendMessage(this.envelopToMessage(resultingEnvelop))
            }
        }


        async callRemote (envelop : EnvelopCall, message : Message) : Promise<unknown> {
            if (!this.media) throw new Error("Not connected to media")

            return new Promise((resolve, reject) => {
                let timeoutHandler : SetTimeoutHandler  = null

                if (message.timeout > 0) {
                    timeoutHandler = setTimeout(() => {
                        this.logger && this.logger.debug("Timeout occurred for: " + JSON.stringify(envelop))

                        if (this.awaitingResponse.has(envelop.id)) {
                            this.awaitingResponse.delete(envelop.id)

                            reject(new Error("Timeout while waiting for remote call"))
                        }
                    }, message.timeout)
                }

                this.awaitingResponse.set(envelop.id, [ resolve, reject, envelop, timeoutHandler ])

                this.sendMessage(this.envelopToMessage(envelop))

                if (!message.requiresResult) resolve()
            })
        }
    }
){}

