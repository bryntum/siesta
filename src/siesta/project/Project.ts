import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/Test.js"

//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Project extends base {
        name            : string        = ''

        options         : TestDescriptor<any>   = undefined


        planGlob (glob : string) {

        }


        planDir (dir : string, descriptor? : TestDescriptor<any>) {

        }


        planFile (file : string, descriptor? : TestDescriptor<any>) {

        }

        async start () {}
    }
) {}
