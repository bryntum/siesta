import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestDescriptorBrowser } from "../../test/TestDescriptorBrowser.js"
import { ContextDashboardIframe } from "../ContextDashboardIframe.js"
import { ContextProviderTargetBrowser } from "./ContextProviderTargetBrowser.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderDashboardIframe extends Mixin(
    [ ContextProviderTargetBrowser ],
    (base : ClassUnion<typeof ContextProviderTargetBrowser>) =>

    class ContextProviderDashboardIframe extends base {

        supportsBrowser         : boolean           = true
        supportsNodejs          : boolean           = false

        contextClass            : typeof ContextDashboardIframe    = ContextDashboardIframe


        async doCreateContext (desc? : TestDescriptorBrowser) : Promise<InstanceType<this[ 'contextClass' ]>> {
            if (!this.launcher.dashboardConnector) throw new Error("Need to be connected to dashboard")

            const connector     = this.launcher.dashboardConnector

            return this.contextClass.new({
                provider        : this,
                contextId       : await connector.createIframeContext(desc)
            }) as InstanceType<this[ 'contextClass' ]>
        }

        static providerName : string = 'dashboardiframe'
    }
) {}
