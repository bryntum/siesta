import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Channel } from "../channel/Channel.js"
import { ChannelBrowserIframe } from "../channel/ChannelBrowserIframe.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerNoop } from "../reporter/ColorerNoop.js"
import { Reporter } from "../reporter/Reporter.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherBrowser extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherBrowser extends base {

        c               : Colorer               = ColorerNoop.new()

        reporterClass   : typeof Reporter       = ReporterBrowser
        colorerClass    : typeof Colorer        = ColorerNoop



        get targetContextChannelClass () : typeof Channel {
            return ChannelBrowserIframe
        }


        print (str : string) {
            console.log(str)
        }
    }
) {}
