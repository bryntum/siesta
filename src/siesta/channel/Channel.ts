import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Port } from "../../port/Port.js"

//---------------------------------------------------------------------------------------------------------------------
export class Channel extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) => {

        class Channel extends base {
            childPortClassUrl       : string                = ''

            childPortClassSymbol    : string                = ''

            parentPort              : Port                  = undefined

            parentPortClass         : typeof Port           = Port


            async setup () {
                throw new Error("Abstract method")
            }
        }

        return Channel
    }
) {}
