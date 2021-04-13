import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Hook } from "../hook/Hook.js"
import { Logger, LogMethod } from "./Logger.js"


export class LoggerHookable extends Mixin(
    [ Logger ],
    (base : ClassUnion<typeof Logger>) =>

    class LoggerHookable extends base {

        onLogMessageHook : Hook<[ method : LogMethod, message : unknown[] ]>     = new Hook()


        printLogMessage (method : LogMethod, ...message : string[]) {
            this.onLogMessageHook.trigger(method, message)
        }
    }
){}
