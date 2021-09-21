import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaNodeWebSocketParent } from "../../rpc/media/MediaNodeWebSocketParent.js"
import { MediaSameContext } from "../../rpc/media/MediaSameContext.js"
import { EnvironmentType } from "../common/Environment.js"
import { ContextProvider } from "../context/context_provider/ContextProvider.js"
import { ContextProviderBrowserIframe } from "../context/context_provider/ContextProviderBrowserIframe.js"
import { ProjectDescriptorBrowser } from "../project/ProjectDescriptor.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeBrowser } from "../runtime/RuntimeBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Dashboard } from "../ui/Dashboard.js"
import { DashboardConnectorServer } from "./DashboardConnector.js"
import { Launcher } from "./Launcher.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

        keepNLastResults        : number                            = 5

        contextProviderConstructors : (typeof ContextProvider)[]    = [
            ContextProviderBrowserIframe
        ]

        print (str : string) {
            console.log(str)
        }


        getMaxLen () : number {
            return 250
        }


        async launchDashboardUI () {
            this.dashboard          = Dashboard.new()

            const dashboardPort     = this.dashboard.connector
            const dashboardMedia    = new MediaSameContext()
            dashboardPort.media     = dashboardMedia

            const launcherPort      = this.dashboardConnector = DashboardConnectorServer.new({ launcher : this })
            const launcherMedia     = new MediaSameContext()
            launcherPort.media      = launcherMedia

            launcherMedia.targetMedia       = dashboardMedia
            dashboardMedia.targetMedia      = launcherMedia

            dashboardPort.connect()
            await launcherPort.connect()

            await launcherPort.startDashboard(this.projectData, this.getDescriptor())
        }


        onUnknownError (e : unknown) {
            throw e
        }


        async setup () {
            this.styles         = (await import(`../reporter/styling/theme_universal.js`)).styles

            await super.setup()
        }


        getSuitableContextProviders (environment : EnvironmentType) : ContextProvider[] {
            if (environment === 'browser')
                return this.contextProviders
            else if (environment === 'nodejs')
                return []
            else if (environment === 'deno')
                return []
            else
                // for isomorphic code any provider is ok
                return this.contextProviders
        }
    }
) {}
