import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LoggerConsole } from "../../logger/LoggerConsole.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerBrowser } from "../reporter/ColorerBrowser.js"
import { Reporter } from "../reporter/Reporter.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectBrowser extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) =>

    class ProjectBrowser extends base {

        logger          : Logger            = LoggerConsole.new()

        reporterClass   : typeof Reporter   = ReporterBrowser
        colorerClass    : typeof Colorer    = ColorerBrowser


        testContextProviderConstructors   : (typeof TestContextProvider)[]      = [ ]


        buildBaseUrl () : string {
            const url           = new URL(window.location.href)

            url.hash            = ''
            url.search          = ''

            return url.href
        }
    }
) {}
