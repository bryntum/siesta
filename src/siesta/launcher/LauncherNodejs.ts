import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Channel } from "../channel/Channel.js"
import { ChannelNodeIpc } from "../channel/ChannelNodeIpc.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherNodejs extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherNodejs extends base {

        get targetContextChannelClass () : typeof Channel {
            return ChannelNodeIpc
        }
    }
) {}
