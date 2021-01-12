import path from 'path'
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Channel } from "../channel/Channel.js"
import { ChannelNodeIpc } from "../channel/ChannelNodeIpc.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerNodejs } from "../reporter/ColorerNodejs.js"
import { Reporter } from "../reporter/Reporter.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { Launcher } from "./Launcher.js"
import { ChannelProjectExtractor } from "./ProjectExtractor.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherNodejs extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherNodejs extends base {

        c               : Colorer               = ColorerNodejs.new()

        reporterClass   : typeof Reporter       = ReporterNodejs
        colorerClass    : typeof Colorer        = ColorerNodejs


        // channelConstructors     : (typeof Channel)[]      = [ ChannelNodeIpc ]


        get targetContextChannelClass () : typeof Channel {
            return ChannelNodeIpc
        }


        print (str : string) {
            process.stdout.write(str)
        }


        async setup () {
            const parseResult       = await this.prepareOptions()

            const channel : ChannelProjectExtractor    = this.projectExtractorChannelClass.new()

            await channel.setup()

            const parentPort        = channel.parentPort

            const projectUrl        = this.prepareProjectFileUrl(parseResult.argv[ 0 ])

            this.projectDescriptor  = await parentPort.extractProject(projectUrl)

            this.projectDescriptor.projectPlan.descriptor.url   = projectUrl.replace(/\/[^/]*?$/, '')

            await parentPort.disconnect()
        }


        prepareProjectFileUrl (url : string) : string {
            if (/https?:/i.test(url)) {

            }
            else if (/file:/.test(url)) {

            }
            else {
                // assume plain fs path here
                return path.resolve(url)
            }

            return url
        }
    }
) {}
