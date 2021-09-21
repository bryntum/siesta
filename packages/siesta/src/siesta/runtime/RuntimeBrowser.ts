import { Runtime } from "./Runtime.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class RuntimeBrowser extends Runtime {

    get inputArguments () : string[] {
        // TODO should extract search params from `location.href` here
        return []
    }


    get scriptUrl () : string {
        const url           = new URL(window.location.href)

        url.hash            = ''
        url.search          = ''

        return url.toString()
    }
}
