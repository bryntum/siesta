import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ContextProvider } from "../../context_provider/ContextProvider.js"
import { Logger } from "../../logger/Logger.js"
import { Dispatcher } from "../project/Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class LocalContextProvider extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) => {

        class LocalContextProvider extends base {
            dispatcher      : Dispatcher        = undefined


            get logger () : Logger {
                return this.dispatcher.project.logger
            }

            set logger (value : Logger) {
            }
        }

        return LocalContextProvider
    }
) {}
