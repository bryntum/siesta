import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContext } from "../../context/ExecutionContext.js"
import { ContextProvider } from "../../context_provider/ContextProvider.js"
import { Logger } from "../../logger/Logger.js"
import { Dispatcher } from "../project/Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProvider extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) => {

        class TestContextProvider extends base {
            dispatcher      : Dispatcher        = undefined


            get logger () : Logger {
                return this.dispatcher.project.logger
            }

            set logger (value : Logger) {
            }


            async createTestContext () : Promise<ExecutionContext> {
                const context       = await this.createContext()

                // context.evaluate(() => {
                //     globalThis.__SIESTA__ = {
                //         communicate : 'IPC'
                //     }
                // })

                return context
            }
        }

        return TestContextProvider
    }
) {}
