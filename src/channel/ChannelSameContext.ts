import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { MediaSameContext } from "../port/MediaSameContext.js"
import { Media, Port } from "../port/Port.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelSameContext extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelSameContext extends base {
            parentPort              : Port                  = undefined
            parentPortClass         : typeof Port           = Port

            childPort               : Port                  = undefined

            parentMedia             : Media                 = undefined
            childMedia              : Media                 = undefined

            mediaClass              : typeof MediaSameContext   = MediaSameContext


            async setup () {
                const parentMedia           = this.parentMedia  = new this.mediaClass()
                const childMedia            = this.childMedia   = new this.mediaClass()

                parentMedia.targetMedia     = childMedia
                childMedia.targetMedia      = parentMedia

                const parentPort            = this.parentPort = new this.parentPortClass
                parentPort.media            = parentMedia

                const module                = await import(this.childPortClassUrl)
                const symbol                = module[ this.childPortClassSymbol ]

                const childPort             = this.childPort = new symbol()
                childPort.media             = childMedia

                await Promise.all([ parentPort.connect(), childPort.connect() ])
            }
        }

        return ChannelSameContext
    }
) {}
