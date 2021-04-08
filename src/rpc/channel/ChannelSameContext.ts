import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSameContext } from "../media/MediaSameContext.js"
import { Port } from "../port/Port.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelSameContext extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelSameContext extends base {
            parentPort              : Port                  = undefined
            parentPortClass         : typeof Port           = Port

            childPort               : Port                  = undefined

            parentMedia             : MediaSameContext      = undefined
            childMedia              : MediaSameContext      = undefined


            async setup () {
                const parentMedia           = this.parentMedia  = new MediaSameContext()
                const childMedia            = this.childMedia   = new MediaSameContext()

                parentMedia.targetMedia     = childMedia
                childMedia.targetMedia      = parentMedia

                const parentPort            = this.parentPort = new this.parentPortClass
                parentPort.media            = parentMedia

                const module                = await import(this.childPortClassUrl)
                const childPortClass        = module[ this.childPortClassSymbol ]

                const childPort             = this.childPort = new childPortClass()
                childPort.media             = childMedia

                await Promise.all([ parentPort.connect(), childPort.connect() ])
            }
        }

        return ChannelSameContext
    }
) {}
