import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestLauncherBrowserParent } from "../test/port/TestLauncherBrowser.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Dispatcher, LauncherConnectorClassLocator } from "./Dispatcher.js"
import { LauncherNodejs } from "./LauncherNodejs.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class DispatcherNodejs extends Mixin(
    [ Dispatcher ],
    (base : ClassUnion<typeof Dispatcher>) =>

    class DispatcherNodejs extends base {
        launcher                    : LauncherNodejs


        getTestLaunchDelay () : number {
            // delay the launch when in headless mode, to give time the dev tools on page to initialize
            // otherwise, the test might complete before it, missing any breakpoints
            return this.launcher.headless === false ? 1500 : 0
        }


        getLauncherConnectorInfo (desc : TestDescriptor) : LauncherConnectorClassLocator {
            return (desc instanceof TestDescriptorBrowser) && desc.simulation === 'native'
                ? {
                    server  : { launcherConnectorClass : TestLauncherBrowserParent },
                    client  : {
                        importerUrl     : 'src/siesta/test/port/TestLauncherBrowser.js',
                        symbol          : 'TestLauncherBrowserChild'
                    }
                }
                : super.getLauncherConnectorInfo(desc)
        }


        reportLaunchFailure (descriptor : TestDescriptor, exception : any) {
            // console.log("this.launcher.isClosingDashboard", this.launcher.isClosingDashboard)

            if (!this.launcher.isClosingDashboard) super.reportLaunchFailure(descriptor, exception)
        }
    }
) {}
