import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Hook } from "../hook/Hook.js"
import { LogMethod } from "../logger/Logger.js"
import { lastElement } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export type ExceptionType   = 'exception' | 'rejection'

export type OutputType      = 'stdout' | 'stderr'

//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContext extends Base {
    attachments         : ExecutionContextAttachable[]         = []


    attach (attachment : ExecutionContextAttachable) {
        this.attachments.push(attachment)
    }


    detach (attachment : ExecutionContextAttachable) {
        if (lastElement(this.attachments) !== attachment) throw new Error("Invalid execution context attachment state")

        this.attachments.pop()
    }


    onException (exception : unknown, type : ExceptionType) {
        const attachment    = lastElement(this.attachments)

        attachment.onExceptionHook.trigger(attachment, type, exception)
    }


    onConsole (method : LogMethod, ...message : unknown[]) {
        const attachment    = lastElement(this.attachments)

        attachment.onConsoleHook.trigger(attachment, method, message)
    }


    onOutput (method : OutputType, output : string, outputOriginal : string | Uint8Array, originalWrite : (str : string) => any, scope : object) {
        const attachment    = lastElement(this.attachments)

        // strip the trailing newline, as it will cause an extra empty line in the output
        attachment.onOutputHook.trigger(attachment, method, output/*.replace(/\n$/m, '')*/, outputOriginal, originalWrite, scope)
    }


    setup () {
        throw new Error("Abstract method")
    }


    destroy () {
        throw new Error("Abstract method")
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextAttachable extends Mixin(
    [],
    (base : ClassUnion) =>

    class ExecutionContextAttachable extends base {
        onExceptionHook : Hook<[ this, ExceptionType, unknown ]>    = new Hook()

        onConsoleHook : Hook<[ this, LogMethod, unknown[] ]>        = new Hook()

        onOutputHook : Hook<[ this, OutputType, string, string | Uint8Array, (str : string | Uint8Array) => any, object ]>           = new Hook()
    }
){}
