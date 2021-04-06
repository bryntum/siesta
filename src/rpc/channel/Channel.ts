import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Media } from "../media/Media.js"
import { Port } from "../port/Port.js"

//---------------------------------------------------------------------------------------------------------------------
export class Channel extends Mixin(
    [],
    (base : ClassUnion) => {

        class Channel extends base {
            childPortClassUrl       : string                = ''
            childPortClassSymbol    : string                = ''

            childMediaClassUrl      : string                = ''
            childMediaClassSymbol   : string                = ''

            parentPort              : Port                  = undefined
            parentPortClass         : typeof Port           = Port

            parentMedia             : Media                 = undefined
            parentMediaClass        : typeof Media          = Media


            async setup () {
                throw new Error("Abstract method")
            }
        }

        return Channel
    }
) {}
