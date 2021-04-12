import { Base } from "../class/Base.js"


//---------------------------------------------------------------------------------------------------------------------
class QueuedCall extends Base {
    host            : any               = undefined
    prop            : string            = ''

    next            : QueuedCall        = undefined

    activate        : Function          = undefined


    finalize () {
        this.next?.activate()

        this.next   = undefined
    }


    wrap (func : Function, context : any, args : unknown[]) : Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.activate = () => {
                this.host[ this.prop ] = this

                func.apply(context, args).then(resolved => {
                    resolve(resolved)

                    this.finalize()
                }, rejected => {
                    reject(rejected)

                    this.finalize()
                })
            }
        })
    }


    get last () : QueuedCall {
        let last    : QueuedCall    = this

        while (last.next) last = last.next

        return last
    }
}


export const queued = function (propName? : string) : MethodDecorator {

    return function (target : object, propertyKey : string, descriptor : TypedPropertyDescriptor<any>) : void {
        const originalMethod    = descriptor.value
        const queueProperty     = propName || `$${ originalMethod.name }`

        descriptor.value        = async function (this : object, ...args : unknown[]) {
            const currentCall   = this[ queueProperty ] as QueuedCall
            const newCall       = QueuedCall.new({ host : this, prop : queueProperty })

            const promise       = newCall.wrap(originalMethod, this, args)

            if (currentCall === undefined) {
                newCall.activate()
            } else
                currentCall.last.next   = newCall

            return promise
        }
    }
}
