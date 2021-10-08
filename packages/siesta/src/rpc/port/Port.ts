import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { MIN_SMI, SetTimeoutHandler } from "../../util/Helpers.js"
import { delay } from "../../util/TimeHelpers.js"
import { Media } from "../media/Media.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type EnvelopId   = number

let ENVELOP_COUNTER         : EnvelopId = 0

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Message extends Base {
    requiresResult      : boolean   = true

    timeout             : number    = 0
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class EnvelopCall extends Base {
    id                  : EnvelopId                     = ENVELOP_COUNTER++

    payload             : [ string, ...unknown[] ]      = undefined
}

export class EnvelopResult extends Base {
    inResponseOf        : EnvelopId     = MIN_SMI

    isRejection         : boolean       = false

    payload             : unknown       = undefined
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ensureMessagesStorage = (target : Port) => {
    if (!target.hasOwnProperty('localMessages')) {
        target.localMessages            = Object.create(target.localMessages || null)
        target.remoteMessages           = Object.create(target.remoteMessages || null)
        target.remoteWrappedMessages    = Object.create(target.remoteWrappedMessages || null)
    }

    return target
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const validatePrototype = (target : Port, propertyKey : string, decoratorName : string) => {
    if (!(target instanceof Port))
        throw new Error(
            // @ts-expect-error
            `The property [${ propertyKey }] of class [${ target.constructor.name }] is decorated with @${ decoratorName }, but class does not include the Port mixin.`
        )
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const remote = (messageDesc : Partial<Message> = Message.new()) : PropertyDecorator => {

    const message       = Message.maybeNew(messageDesc)

    return function (target : Port, propertyKey : string) : void {
        validatePrototype(target, propertyKey, 'remote')

        const { remoteMessages } = ensureMessagesStorage(target)

        remoteMessages[ propertyKey ] = message

        Object.defineProperty(target, propertyKey, {
            value   : function (this : Port, ...args : unknown[]) : Promise<unknown> {
                return this.callRemote(
                    EnvelopCall.new({ payload : [ propertyKey, ...args ] }),
                    message
                )
            }
        })
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let flashScopeStorage : Port = undefined


export const remote_wrapped = (messageDesc : Partial<Message> = Message.new()) : MethodDecorator => {
    const message       = Message.maybeNew(messageDesc)

    return function (target : Port, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
        validatePrototype(target, propertyKey, 'remote_wrapped')

        const { remoteWrappedMessages } = ensureMessagesStorage(target)

        remoteWrappedMessages[ propertyKey ] = function (...args : unknown[]) {
            const scope         = flashScopeStorage

            flashScopeStorage   = undefined

            return scope.callRemote(
                EnvelopCall.new({ payload : [ propertyKey, ...args ] }),
                message
            )
        }
    }
}


export const local = function (messageDesc : Partial<Message> = Message.new()) : MethodDecorator {
    const message       = Message.maybeNew(messageDesc)

    return function (target : Port, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
        validatePrototype(target, propertyKey, 'local')

        const { localMessages } = ensureMessagesStorage(target)

        localMessages[ propertyKey ] = message
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Port extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Port extends base {
        media                   : Media         = undefined
        connected               : boolean       = false

        // prototype values
        localMessages           : object
        remoteMessages          : object
        remoteWrappedMessages   : object

        $logger                 : Logger        = undefined

        maxConnectionAttempts   : number        = Number.MAX_SAFE_INTEGER
        connectionTimeout       : number        = 10000
        connectionInterval      : number        = 500

        awaitingResponse        : Map<EnvelopId, [ Function, Function, EnvelopCall, SetTimeoutHandler ]> = new Map()


        get remotes () : this {
            flashScopeStorage       = this

            return this.remoteWrappedMessages as this
        }


        get logger () : Logger {
            return this.$logger
        }

        set logger (value : Logger) {
            this.$logger    = value
        }


        async connect () : Promise<any> {
            if (this.connected) throw new Error("Already connected")

            let start                   = Date.now()
            let connectionAttempts      = 0

            this.media.port             = this

            do {
                try {
                    connectionAttempts++

                    this.logger?.info(`Connection attempt: ${ connectionAttempts }`)

                    await this.media.doConnect()

                    this.connected      = true

                    return
                } catch (e) {
                    this.logger?.info(`Connection attempt ${ connectionAttempts } failed: ${ e.stack || e.message || e }`)

                    await delay(this.connectionInterval)
                }

            } while (Date.now() - start < this.connectionTimeout && connectionAttempts < this.maxConnectionAttempts)

            throw new Error("Connection failed")
        }


        async disconnect (silent : boolean = false) : Promise<any> {
            this.awaitingResponse.forEach(value => {
                !silent && value[ 1 ](new Error(`Channel disconnected during the call ${ JSON.stringify(value[ 2 ]) }`))
            })

            this.awaitingResponse.clear()

            await this.media.doDisconnect()

            this.connected      = false
        }


        async receiveEnvelop (envelop : EnvelopCall | EnvelopResult) {
            if (envelop instanceof EnvelopResult) {
                const inResponseOf  = envelop.inResponseOf
                const handler       = this.awaitingResponse.get(inResponseOf)

                if (!handler) {
                    this.logger?.debug(`Response for unknown envelop, timeout occurred?\n${ JSON.stringify(envelop) }`)
                } else {
                    if (handler[ 3 ] !== null) clearTimeout(handler[ 3 ])

                    this.awaitingResponse.delete(inResponseOf)

                    if (envelop.isRejection) {
                        handler[ 1 ](envelop.payload)
                    } else {
                        handler[ 0 ](envelop.payload)
                    }
                }
            }
            else if (envelop instanceof EnvelopCall) {
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
                        inResponseOf        : envelop.id,
                        isRejection         : true,
                        payload             : e,
                    })
                }

                this.media.sendEnvelop(resultingEnvelop)
            }
        }


        async callRemote (envelop : EnvelopCall, message : Message) : Promise<void> {
            if (!this.connected) throw new Error(`Not connected to media, sending envelop: ${ JSON.stringify(envelop) }`)

            return new Promise((resolve, reject) => {
                let timeoutHandler : SetTimeoutHandler  = null

                if (message.timeout > 0) {
                    timeoutHandler = setTimeout(() => {
                        this.awaitingResponse.delete(envelop.id)

                        this.logger?.debug("Timeout occurred for: " + JSON.stringify(envelop))

                        reject(new Error("Timeout while waiting for remote call"))
                    }, message.timeout)
                }

                this.awaitingResponse.set(envelop.id, [ resolve, reject, envelop, timeoutHandler ])

                this.media.sendEnvelop(envelop)

                if (!message.requiresResult) resolve()
            })
        }
    }
){}
