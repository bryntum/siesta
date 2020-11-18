import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContextSameContext } from "../context/ExecutionContextSameContext.js"
import { ContextProvider } from "./ContextProvider.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderSameContext extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

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

