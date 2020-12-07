import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ContextProvider } from "../../context_provider/ContextProvider.js"
import { Logger } from "../../logger/Logger.js"
import { Launch } from "../project/Launch.js"
import { TestLauncherParent } from "../test/channel/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProvider extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) => {

        class TestContextProvider extends base {
            contextClass        : TestLauncherParent

            launch              : Launch        = undefined


            get logger () : Logger {
                return this.launch.project.logger
            }

            set logger (value : Logger) {
            }


            async createTestContext (desc : TestDescriptor) : Promise<TestLauncherParent> {
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
