import { Channel } from "../../channel/Channel.js"
import { ChannelBrowserIframe } from "../../channel/ChannelBrowserIframe.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ProjectOptions, ProjectOptionsBrowser } from "../project/ProjectOptions.js"
import { Reporter } from "../reporter/Reporter.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherBrowser extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherBrowser extends base {

        reporterClass   : typeof Reporter       = ReporterBrowser

        projectOptionsClass : typeof ProjectOptions = ProjectOptionsBrowser
        testDescriptorClass : typeof TestDescriptor = TestDescriptorBrowser


        get targetContextChannelClass () : typeof Channel {
            return ChannelBrowserIframe
        }


        print (str : string) {
            console.log(str)
        }
    }
) {}
