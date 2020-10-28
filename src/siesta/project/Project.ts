import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Project extends base {
        name            : string        = ''


        planGlob (glob : string) {

        }


        planDir (dir : string) {

        }

        planFile (file : string) {

        }

        async start () {}
    }
) {}
