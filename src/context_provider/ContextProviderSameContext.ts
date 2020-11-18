import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContext } from "../context/ExecutionContext.js"
import { ExecutionContextSameContext } from "../context/ExecutionContextSameContext.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderSameContext extends Mixin(
    [ ExecutionContext ],
    (base : ClassUnion<typeof ExecutionContext>) =>

    class ContextProviderSameContext extends base {

        async setup () {
            // do nothing
        }


        async destroy () {
            // do nothing
        }


        async createContext () : Promise<ExecutionContextSameContext> {
            return ExecutionContextSameContext.new()
        }
    }
) {}

