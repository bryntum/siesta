import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { Hook } from "../hook/Hook.js"
import { lastElement } from "../util/Helpers.js"
import { isErrorEvent } from "../util/Typeguards.js"
import { ExecutionContext, ExecutionContextAttachable } from "./ExecutionContext.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ExecutionContextBrowser extends ExecutionContext {
    attachments                 : ExecutionContextAttachableBrowser[]


    uncaughtExceptionListener   : AnyFunction       = undefined
    uncaughtRejectionListener   : AnyFunction       = undefined


    onResourceLoadFailure (event : Event) {
        const attachment    = lastElement(this.attachments)

        attachment.onResourceLoadFailureHook.trigger(attachment, event)
    }


    setup () {
        // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
        this.uncaughtExceptionListener  = (event : ErrorEvent | Event) => {
            if (isErrorEvent(event))
                this.onException('exception', event.error, event)
            else
                this.onResourceLoadFailure(event)

        }
        this.uncaughtRejectionListener  = (event : PromiseRejectionEvent) => {
            this.onException('rejection', event.reason, event)
        }

        window.addEventListener('error', this.uncaughtExceptionListener, true)
        window.addEventListener('unhandledrejection', this.uncaughtRejectionListener)
    }


    destroy () {
        window.removeEventListener('error', this.uncaughtExceptionListener, true)
        window.removeEventListener('unhandledrejection', this.uncaughtRejectionListener)

        this.uncaughtRejectionListener  = this.uncaughtExceptionListener = undefined
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ExecutionContextAttachableBrowser extends Mixin(
    [ ExecutionContextAttachable ],
    (base : ClassUnion<typeof ExecutionContextAttachable>) =>

    class ExecutionContextAttachableBrowser extends base {
        onResourceLoadFailureHook : Hook<[ this, Event ]>    = new Hook()
    }
){}
