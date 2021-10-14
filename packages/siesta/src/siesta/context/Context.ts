import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ImporterMap } from "../../Importer.js"
import { Media } from "../../rpc/media/Media.js"
import { Port } from "../../rpc/port/Port.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { preLaunchTest } from "../test/port/LaunchTest.js"
import { ContextProvider } from "./context_provider/ContextProvider.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Context extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Context extends base {
        provider                        : ContextProvider       = undefined

        parentMediaClass                : typeof Media          = Media

        relativeChildMediaModuleUrl     : string                = ''
        relativeChildMediaClassSymbol   : string                = ''


        // non-cyclic, json-only serialization for arguments/result
        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            throw new Error("Abstract method")
        }


        async setup () {
        }


        async destroy () {
            this.provider.freeContext(this)
        }


        // this class was supposed to be generic facility to establish arbitrary Port connection
        // however it turns more and more into specialized test connection
        // perhaps the generic part can be extracted later
        // the main problem is making the code bundler-friendly, which means - no arbitrary dynamic import
        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            throw new Error("Abstract method")
        }


        async preLaunchTest (url : string, testDescriptorStr : string, delayStart : number = 0) : Promise<boolean> {
            return await this.evaluateBasic(preLaunchTest, url, testDescriptorStr, delayStart)
        }


        async seedChildPort (
            relativePortModuleUrl : string, relativePortClassSymbol : string,
            portConfig : object, mediaConfig : object,
            returnPort : boolean = false
        )
            : Promise<Port | undefined>
        {
            return await this.evaluateBasic(
                seedChildPort,
                relativePortModuleUrl,
                relativePortClassSymbol,
                this.relativeChildMediaModuleUrl,
                this.relativeChildMediaClassSymbol,
                portConfig,
                mediaConfig,
                returnPort
            )
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const seedChildPort = async (
    portModuleUrl   : string, portClassSymbol : string,
    mediaModuleUrl  : string, mediaClassSymbol : string,
    portConfig      : object,
    mediaConfig     : object,

    // TODO remove this arg
    // the only case when its safe to return the port from this method is same context
    returnPort      : boolean = false
)
    : Promise<Port | undefined>  =>
{
    const importer                      = globalThis.__SIESTA_IMPORTER__ as ImporterMap

    if (!importer) throw new Error(`No global import map after executing seeding code`)

    const portModuleImporter            = importer.getImporter(portModuleUrl)
    const mediaModuleImporter           = importer.getImporter(mediaModuleUrl)

    if (!portModuleImporter) throw new Error(`Unknown importer module id: ${ portModuleUrl }`)
    if (!mediaModuleImporter) throw new Error(`Unknown importer module id: ${ mediaModuleUrl }`)

    const [ modulePort, moduleMedia ]   = await Promise.all([ portModuleImporter(), mediaModuleImporter() ])

    const media     = new moduleMedia[ mediaClassSymbol ]
    Object.assign(media, mediaConfig)

    const port      = new modulePort[ portClassSymbol ]
    Object.assign(port, portConfig)

    port.media      = media

    port.connect()

    if (returnPort) return port
}
