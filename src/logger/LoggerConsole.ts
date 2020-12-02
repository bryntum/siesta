import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Logger, LogMethod } from "./Logger.js"


export class LoggerConsole extends Mixin(
    [ Logger ],
    (base : ClassUnion<typeof Logger>) =>

    class Logger extends base {
        printLogMessage (method : LogMethod, ...message : string[]) {
            console[ method ](...message)
        }
    }
){}
