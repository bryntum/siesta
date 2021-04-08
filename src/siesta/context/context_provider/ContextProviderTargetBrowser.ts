import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { ContextBrowser } from "../ContextBrowser.js"
import { ContextProvider } from "./ContextProvider.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderTargetBrowser extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) => {

    class ContextProviderTargetBrowser extends base {
        contextClass            : typeof ContextBrowser    = ContextBrowser
    }

    return ContextProviderTargetBrowser
}) {}



