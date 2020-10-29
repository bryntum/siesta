import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/Test.js"

//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Project extends base {
        name            : string        = ''

        options         : TestDescriptor   = undefined

        someProjectOption   : boolean   = false


        planGlob (glob : string) {

        }


        planDir (dir : string, descriptor? : TestDescriptor) {

        }


        planFile (file : string, descriptor? : TestDescriptor) {

        }

        async start () {}
    }
) {}
