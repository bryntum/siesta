import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderBrowserIframe } from "../context/context_provider/ContextProviderBrowserIframe.js"
import { ProjectDescriptorBrowser } from "../project/ProjectDescriptor.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeBrowser } from "../runtime/RuntimeBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Dashboard } from "../ui/Dashboard.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherBrowser extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherBrowser extends base {

        reporterClass           : typeof ReporterBrowser            = ReporterBrowser
        projectDescriptorClass  : typeof ProjectDescriptorBrowser   = ProjectDescriptorBrowser
        testDescriptorClass     : typeof TestDescriptorBrowser      = TestDescriptorBrowser
        runtimeClass            : typeof Runtime                    = RuntimeBrowser

        ui                      : boolean                           = true

        dashboard               : Dashboard                         = undefined


        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderBrowserIframe
        ]

        print (str : string) {
            console.log(str)
        }


        async doStart () {
            if (this.ui) {
                this.dashboard = Dashboard.new({ launcher : this })

                await this.dashboard.start()
            } else {
                await super.doStart()
            }
        }
    }
) {}
