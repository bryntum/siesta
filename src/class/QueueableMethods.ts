import { AnyConstructor, Mixin } from "../class/Mixin.js"

// TODO support several queues: @queueable('queue1')


//---------------------------------------------------------------------------------------------------------------------
export class QueueableMethods extends Mixin(
    [],
    (base : AnyConstructor) =>

    class QueueableMethods extends base {
        $queue          : Promise<any>      = Promise.resolve()
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export const queueable = function () : MethodDecorator {

    return function (target : QueueableMethods, propertyKey : string, _descriptor : TypedPropertyDescriptor<any>) : void {
        const originalMethod    = target[ propertyKey ]

        target[ propertyKey ] = async function (this : QueueableMethods) {
            return this.$queue = this.$queue.then(() => {
                return originalMethod.apply(this, arguments)
            })
        }
    }
}
