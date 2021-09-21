import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSameContext } from "../../rpc/media/MediaSameContext.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { Context } from "./Context.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ContextSameContext extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextSameContext extends base {

        parentMediaClass        : typeof MediaSameContext         = MediaSameContext

        relativeChildMediaModuleUrl     : string    = 'src/rpc/media/MediaSameContext.js'
        relativeChildMediaClassSymbol   : string    = 'MediaSameContext'


        async evaluateBasic <A extends unknown[], R> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // @ts-ignore
            return func(...args)
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            const parentMedia   = new this.parentMediaClass()

            parentPort.media            = parentMedia
            parentPort.handshakeType    = 'parent_first'

            const childPort     = await this.seedChildPort(
                relativeChildPortModuleUrl,
                relativeChildPortClassSymbol,
                { handshakeType : 'parent_first' },
                {},
                true
            )

            const childMedia    = childPort.media as MediaSameContext

            parentMedia.targetMedia = childMedia
            childMedia.targetMedia  = parentMedia

            await parentPort.connect()
        }
    }
) {}
