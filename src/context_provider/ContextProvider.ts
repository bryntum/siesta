import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContext } from "../context/ExecutionContext.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProvider extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class ContextProvider extends base {

        async setup () {
            throw new Error("Abstract method")
        }


        async destroy () {
            throw new Error("Abstract method")
        }


        async createContext () : Promise<ExecutionContext> {
            throw new Error("Abstract method")
        }
    }
) {}


