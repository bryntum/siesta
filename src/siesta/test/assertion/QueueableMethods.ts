import { AnyConstructor, Mixin } from "../../../class/Mixin.js"

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
export const queued = function () : MethodDecorator {

    return function (target : QueueableMethods, propertyKey : string, descriptor : TypedPropertyDescriptor<any>) : void {
        const originalMethod    = descriptor.value

        descriptor.value = async function (this : QueueableMethods, ...args : unknown[]) {
            return this.$queue = this.$queue.then(() => {
                return originalMethod.apply(this, args)
            })
        }
    }
}
