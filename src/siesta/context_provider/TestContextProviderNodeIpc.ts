import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextRemoteNodeIpc } from "../../context/ExecutionContextRemoteNodeIpc.js"
import { ContextProviderNodeIpc } from "../../context_provider/ContextProviderNodeIpc.js"
import { TestContextNodeIpc } from "../test/context/TestContextNodeIpc.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderNodeIpc extends Mixin(
    [ TestContextProvider, ContextProviderNodeIpc ],
    (base : ClassUnion<typeof TestContextProvider, typeof ContextProviderNodeIpc>) => {

        class TestContextProviderNodeIpc extends base {
            childChannelClassUrl         : string            = import.meta.url
                .replace(/^file:/, '')
                .replace(/context_provider\/TestContextProviderNodeIpc.js$/, 'test/context/TestContextNodeIpc.js')

            childChannelClassSymbol      : string            = 'TestContextNodeIpcChild'

            parentChannelClass : typeof ExecutionContextRemoteNodeIpc   = TestContextNodeIpc
        }

        return TestContextProviderNodeIpc
    }
) {}
