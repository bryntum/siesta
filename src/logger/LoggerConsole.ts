import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Logger, LogMethod } from "./Logger.js"


export class LoggerConsole extends Mixin(
    [ Logger ],
    (base : ClassUnion<typeof Logger>) =>

    class LoggerConsole extends base {
        printLogMessage (method : LogMethod, ...message : unknown[]) {
            console[ method ](...message)
        }
    }
){}
