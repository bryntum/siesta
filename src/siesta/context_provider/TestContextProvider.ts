import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { Launch } from "../project/Launch.js"
import { TestLauncherParent } from "../test/channel/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProvider extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) => {

        class TestContextProvider extends base {
            launch              : Launch        = undefined

            async setup () {
                throw new Error("Abstract method")
            }


            async destroy () {
                throw new Error("Abstract method")
            }


            get logger () : Logger {
                return this.launch.project.logger
            }

            set logger (value : Logger) {
            }


            async createTestContext (desc : TestDescriptor) : Promise<TestLauncherParent> {
                throw new Error("Abstract method")
            }
        }

        return TestContextProvider
    }
) {}
