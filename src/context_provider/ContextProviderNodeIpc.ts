import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContext } from "../context/ExecutionContext.js"
import { ExecutionContextRemote } from "../context/ExecutionContextRemote.js"
import { ExecutionContextSameContext } from "../context/ExecutionContextSameContext.js"
import { ContextProvider } from "./ContextProvider.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderNodeIpc extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderNodeIpc extends base {

        contexts        : any


        async setup () {
        }


        async destroy () {
            // do nothing
        }


        async createContext () : Promise<ExecutionContextRemote> {
            return //ExecutionContextSameContext.new()
        }
    }
) {}

