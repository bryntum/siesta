import { default as child_process } from "child_process"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContextRemoteNodeIpc } from "../context/ExecutionContextRemoteNodeIpc.js"
import { ContextProvider } from "./ContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderNodeIpc extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderNodeIpc extends base {

        async setup () {
        }


        async destroy () {
            // do nothing
        }


        async createContext () : Promise<ExecutionContextRemoteNodeIpc> {
            // TODO there's no need to have a separate file for seeding the child process?
            // one can use `--eval` option of node executable to evaluate a script (along with
            // --input-type=module)
            const childProcess  = child_process.fork(
                import.meta.url
                    .replace(/^file:/, '')
                    .replace(/ContextProviderNodeIpc.js$/, 'ContextProviderNodeIpcSeed.js')
            )

            const context       = ExecutionContextRemoteNodeIpc.new({ media : childProcess })

            await context.setup()

            return context
        }
    }
) {}

