import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { Hook } from "../../../hook/Hook.js"
import { CI } from "../../../iterator/Iterator.js"
import { IsolationLevel } from "../../common/IsolationLevel.js"
import { Launcher } from "../../launcher/Launcher.js"
import { TestDescriptor } from "../../test/TestDescriptor.js"
import { Context } from "../Context.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ContextProvider extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class ContextProvider extends base {

        supportsBrowser         : boolean           = false
        supportsNodejs          : boolean           = false
        supportsDeno            : boolean           = false

        supportsIsolation       : Set<IsolationLevel>   = new Set()

        launcher                : Launcher          = undefined


        contextClass            : typeof Context    = Context

        contexts                : Set<Context>      = new Set()


        maxParallelContexts     : number            = Number.MAX_SAFE_INTEGER

        onSpareSlotAvailableHook : Hook             = new Hook()


        async setup () {
        }


        async destroy () {
            await Promise.allSettled(CI(this.contexts).map(async context => context.destroy()))

            this.contexts.clear()
        }


        async createContext (desc? : TestDescriptor) : Promise<InstanceType<this[ 'contextClass' ]>> {
            if (this.contexts.size >= this.maxParallelContexts) {
                await new Promise<void>(resolve => this.onSpareSlotAvailableHook.once(() => resolve))
            }

            const context       = await this.doCreateContext(desc)

            context.provider    = this

            this.contexts.add(context)

            return context
        }


        freeContext (context : Context) {
            this.contexts.delete(context)

            this.onSpareSlotAvailableHook.trigger()
        }


        async doCreateContext (desc? : TestDescriptor) : Promise<InstanceType<this[ 'contextClass' ]>> {
            throw new Error("Abstract method")
        }


        static providerName : string = 'abstract'
    }
) {}

