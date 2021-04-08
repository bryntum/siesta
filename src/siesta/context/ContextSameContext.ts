import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaSameContext } from "../../rpc/media/MediaSameContext.js"
import { Port } from "../../rpc/port/Port.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { Context } from "./Context.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextSameContext extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextSameContext extends base {

        parentMediaClass        : typeof MediaSameContext         = MediaSameContext

        relativeChildMediaModuleUrl     : string    = 'src/siesta/rpc/media/MediaSameContext.js'
        relativeChildMediaClassSymbol   : string    = 'MediaSameContext'


        async evaluateBasic <A extends unknown[], R> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // @ts-ignore
            return func(...args)
        }


        async setupChannel (parentPort : Port, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            parentPort.media    = new this.parentMediaClass()

            await this.seedChildPort(relativeChildPortModuleUrl, relativeChildPortClassSymbol, {}, {})
        }
    }
) {}
