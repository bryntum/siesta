import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ContextProviderNodeIpc } from "../../context_provider/ContextProviderNodeIpc.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderNodeIpc extends Mixin(
    [ TestContextProvider, ContextProviderNodeIpc ],
    (base : ClassUnion<typeof TestContextProvider, typeof ContextProviderNodeIpc>) => {

        class TestContextProviderNodeIpc extends base {
        }

        return TestContextProviderNodeIpc
    }
) {}
