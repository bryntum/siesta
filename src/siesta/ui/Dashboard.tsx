/** @jsx ChronoGraphJSX.createElement */

import { ChronoGraphJSX, ElementSource } from "chronograph-jsx/src/jsx/ChronoGraphJSX.js"
import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class Dashboard extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Dashboard extends base {
        async start () {
        }


        render () : ElementSource {

            return <div></div>
        }
    }
) {}
