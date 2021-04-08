import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Context } from "./Context.js"

//---------------------------------------------------------------------------------------------------------------------
export class ContextBrowser extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextBrowser extends base {

        async navigate (url : string) {
            throw new Error("Abstract method")
        }
    }
) {}
