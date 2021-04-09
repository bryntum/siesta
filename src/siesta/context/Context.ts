import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Media } from "../../rpc/media/Media.js"
import { Port } from "../../rpc/port/Port.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { ContextProvider } from "./context_provider/ContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class Context extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Context extends base {
        provider            : ContextProvider       = undefined

        parentMediaClass    : typeof Media          = Media

        relativeChildMediaModuleUrl     : string    = ''
        relativeChildMediaClassSymbol   : string    = ''


        // non-cyclic, json-only serialization for arguments/result
        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            throw new Error("Abstract method")
        }


        async setup () {
        }


        async destroy () {
            this.provider.freeContext(this)
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            throw new Error("Abstract method")
        }


        async seedChildPort (
            relativePortModuleUrl : string, relativePortClassSymbol : string,
            portConfig : object, mediaConfig : object,
            returnPort : boolean = false
        )
            : Promise<Port | undefined>
        {
            const siestaPackageRoot = this.provider.launcher.projectData.siestaPackageRootUrl

            return await this.evaluateBasic(
                seedChildPort,
                siestaPackageRoot + relativePortModuleUrl,
                relativePortClassSymbol,
                siestaPackageRoot + this.relativeChildMediaModuleUrl,
                this.relativeChildMediaClassSymbol,
                portConfig,
                mediaConfig,
                returnPort
            )
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
const seedChildPort = async (
    portModuleUrl   : string, portClassSymbol : string,
    mediaModuleUrl  : string, mediaClassSymbol : string,
    portConfig      : object,
    mediaConfig     : object,
    // the only case when its safe to return the port from this method is same context
    returnPort      : boolean = false
)
    : Promise<Port | undefined>  =>
{
    const [ modulePort, moduleMedia ]   = await Promise.all([ import(portModuleUrl), import(mediaModuleUrl) ])

    const media     = new moduleMedia[ mediaClassSymbol ]
    Object.assign(media, mediaConfig)

    const port      = new modulePort[ portClassSymbol ]
    Object.assign(port, portConfig)

    port.media      = media

    port.connect()

    if (returnPort) return port
}
