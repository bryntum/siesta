import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { preLaunchTestBrowser } from "../test/port/LaunchTest.js"
import { Context } from "./Context.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ContextBrowser extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextBrowser extends base {

        async navigate (url : string) {
            throw new Error("Abstract method")
        }


        async preLaunchTest (url : string, testDescriptorStr : string, delayStart : number = 0) : Promise<boolean> {
            // the newly opened page is at "about:blank" url, which is not what people usually assume
            // for example the Vite HMR mechanism fails on such urls
            // another thing is that it seems, for "about:blank" pages you can't make dynamic imports
            // (not a module context?)
            // anyway, to solve this, we need to navigate to some url, which is in the test's address space
            // the only reliable url we have is the test file itself
            // await this.navigate(url)

            return await this.evaluateBasic(preLaunchTestBrowser, url, testDescriptorStr, delayStart)
        }
    }
) {}
