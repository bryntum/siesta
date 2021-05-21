import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Launch } from "./Launch.js"
import { LauncherNodejs } from "./LauncherNodejs.js"

//---------------------------------------------------------------------------------------------------------------------
export class LaunchNodejs extends Mixin(
    [ Launch ],
    (base : ClassUnion<typeof Launch>) =>

    class LaunchNodejs extends base {
        launcher                    : LauncherNodejs        = undefined


        getTestLaunchDelay () : number {
            // delay the launch when in headless mode, to give time the dev tools on page to initialize
            // otherwise, the test might complete before it, missing any breakpoints
            return this.launcher.headless === false ? 1500 : 0
        }
    }
) {}
