import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ContextProviderSameContext } from "../../context_provider/ContextProviderSameContext.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderSameContext extends Mixin(
    [ TestContextProvider, ContextProviderSameContext ],
    (base : ClassUnion<typeof TestContextProvider, typeof ContextProviderSameContext>) => {

        class TestContextProviderSameContext extends base {
        }

        return TestContextProviderSameContext
    }
) {}
