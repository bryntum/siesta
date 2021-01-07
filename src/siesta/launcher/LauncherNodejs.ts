import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Channel } from "../channel/Channel.js"
import { ChannelNodeIpc } from "../channel/ChannelNodeIpc.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerNodejs } from "../reporter/ColorerNodejs.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherNodejs extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherNodejs extends base {

        c           : Colorer       = ColorerNodejs.new()

        channelConstructors     : (typeof Channel)[]      = [ ChannelNodeIpc ]


        get targetContextChannelClass () : typeof Channel {
            return ChannelNodeIpc
        }


        print (str : string) {
            process.stdout.write(str)
        }
    }
) {}
