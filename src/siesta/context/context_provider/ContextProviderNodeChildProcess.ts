import child_process from "child_process"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestDescriptorNodejs } from "../../test/TestDescriptorNodejs.js"
import { ContextNodeChildProcess } from "../ContextNodeChildProcess.js"
import { ContextProvider } from "./ContextProvider.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderNodeChildProcess extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderNodeChildProcess extends base {
        local                   : boolean           = true
        supportsBrowser         : boolean           = false
        supportsNodejs          : boolean           = true

        contextClass            : typeof ContextNodeChildProcess    = ContextNodeChildProcess


        async doCreateContext (desc? : TestDescriptorNodejs) : Promise<InstanceType<this[ 'contextClass' ]>> {
            const childProcess  = child_process.fork(
                '',
                {
                    execArgv : [
                        // '--inspect-brk=127.0.0.1:9339',
                        '--unhandled-rejections=strict',
                        '--trace-warnings',
                        '--input-type', 'module',
                        '--eval', [
                            '(' + evaluateBasicHandler.toString() + ')()'
                        ].join('\n')
                    ]
                }
            )

            return this.contextClass.new({ childProcess }) as InstanceType<this[ 'contextClass' ]>
        }

        static providerName : string = 'nodejs'
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
const evaluateBasicHandler = () => {
    // poor-man, zero-dep `evaluate` handler
    process.on('message', async message => {
        if (message && message.__SIESTA_CONTEXT_EVALUATE_REQUEST__) {
            const func      = globalThis.eval('(' + message.functionSource + ')')

            try {
                const result    = await func(...message.arguments)

                process.send({ __SIESTA_CONTEXT_EVALUATE_RESPONSE__ : true, status : 'resolved', result })
            } catch (rejected) {
                const stack         = String(rejected.stack || '')
                const message       = String(rejected.message || '')

                process.send({ __SIESTA_CONTEXT_EVALUATE_RESPONSE__ : true, status : 'rejected', result : { stack, message } })
            }
        }
    })
}
