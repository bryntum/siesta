import { default as child_process } from "child_process"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContextRemoteNodeIpc } from "../context/ExecutionContextRemoteNodeIpc.js"
import { ContextProvider } from "./ContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderBrowserIframe extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderBrowserIframe extends base {
        childChannelClassUrl         : string            = import.meta.url
            .replace(/^file:\\\\/, '')
            .replace(/context_provider\/ContextProviderBrowserIframe.js$/, 'context/ExecutionContextRemoteNodeIpc.js')

        childChannelClassSymbol      : string            = 'ExecutionContextRemoteNodeIpcChild'


        parentChannelClass : typeof ExecutionContextRemoteNodeIpc   = ExecutionContextRemoteNodeIpc


        async setup () {
        }


        async destroy () {
            // do nothing
        }


        async createContext () : Promise<ExecutionContextRemoteNodeIpc> {
            const childProcess  = child_process.fork(
                '',
                {
                    execArgv : [
                        // '--unhandled-rejections=strict',
                        // '--trace-warnings',
                        // '--inspect-brk=127.0.0.1:9339',
                        '--input-type', 'module',
                        '--eval', [
                            `import { ${this.childChannelClassSymbol} } from "${this.childChannelClassUrl}"`,
                            // `debugger`,
                            // `console.log('ContextProviderBrowserIframe seed launched`,
                            `const context = ${this.childChannelClassSymbol}.new()`,
                            `context.connect()`,
                            // `console.log('ContextProviderBrowserIframe seed connect call issued`,
                        ].join('\n')
                    ]
                }
            )

            const context       = this.parentChannelClass.new({ media : childProcess })

            await context.setup()

            return context
        }
    }
) {}

