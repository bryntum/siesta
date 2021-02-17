import { Channel } from "../../channel/Channel.js"
import { ChannelBrowserIframe } from "../../channel/ChannelBrowserIframe.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ProjectOptionsBrowser } from "../project/ProjectOptions.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherBrowser extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherBrowser extends base {

        reporterClass   : typeof ReporterBrowser            = ReporterBrowser

        projectOptionsClass : typeof ProjectOptionsBrowser  = ProjectOptionsBrowser
        testDescriptorClass : typeof TestDescriptorBrowser  = TestDescriptorBrowser


        get targetContextChannelClass () : typeof Channel {
            return ChannelBrowserIframe
        }


        print (str : string) {
            console.log(str)
        }
    }
) {}
