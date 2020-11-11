import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ContextProviderSameContext } from "../../context_provider/ContextProviderSameContext.js"
import { LocalContextProvider } from "./LocalContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class LocalContextProviderSameContext extends Mixin(
    [ LocalContextProvider, ContextProviderSameContext ],
    (base : ClassUnion<typeof LocalContextProvider, typeof ContextProviderSameContext>) => {

        class LocalContextProviderSameContext extends base {
        }

        return LocalContextProviderSameContext
    }
) {}
