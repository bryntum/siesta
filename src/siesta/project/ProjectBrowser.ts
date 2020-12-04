import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) =>

    class ProjectBrowser extends base {

        logger          : Logger            = LoggerConsole.new()

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = [ ]


        async setupBaseUrl () : Promise<string> {
            throw 1
        }
    }
) {}
