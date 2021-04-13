import { ExecutionContext } from "./ExecutionContext.js"


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextBrowser extends ExecutionContext {

    setup () {
        // window.addEventListener('error', () => {})
        // window.addEventListener('unhandledrejection', () => {})
    }


    destroy () {
        // throw new Error("Abstract method")
    }
}
