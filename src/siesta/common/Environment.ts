import { Base } from "../../class/Base.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { isDeno, isNodejs } from "../../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export type EnvironmentType = 'browser' | 'nodejs' | 'isomorphic' | 'deno'

@serializable({ id : 'Environment' })
export class Environment extends Serializable.mix(Base) {
    type        : EnvironmentType       = 'isomorphic'

    name        : string                = ''

    version     : string                = ''


    detectDeno () : Partial<Environment> {
        return {
            type        : 'deno',
            name        : 'Deno',
            version     : globalThis.Deno.version.deno
        }
    }

    detectNodejs () : Partial<Environment> {
        return {
            type        : 'nodejs',
            name        : 'Node.js',
            version     : process.version
        }
    }

    detectBrowser () : Partial<Environment> {
        const uaString      = navigator.userAgent

        let browser         = 'unknown'
        let version         = ''

        let match

        if (match = /Edg\/(\d+(\.\d+)*)/i.exec(uaString)) {
            browser     = "Edge Chromium"
            version     = match[ 1 ]
        }
        else if (match = /Firefox\/((?:\d+\.?)+)/.exec(uaString)) {
            browser     = "Firefox"
            version     = match[ 1 ]
        }
        else if (match = /chrome.+? edge\/(\d+(\.\d+)?)/i.exec(uaString)) {
            browser     = "Edge"
            version     = match[ 1 ]
        }
        else if (match = /Chrome\/((?:\d+\.?)+)/.exec(uaString)) {
            browser     = "Chrome"
            version     = match[ 1 ]
        }
        else if (match = /MSIE\s*((?:\d+\.?)+)/.exec(uaString)) {
            browser     = "IE"
            version     = match[ 1 ]
        }
        else if (uaString.match(/trident/i) && (match = /rv.(\d\d\.?\d?)/.exec(uaString))) {
            browser     = "IE"
            version     = match[ 1 ]
        }
        else if (match = /Apple.*Version\/((?:\d+\.?)+)\s*(?=Safari\/((?:\d+\.?)+))/.exec(uaString)) {
            browser     = "Safari"
            version     = match[ 1 ] + ' (' + match[ 2 ] + ')'
        }

        return {
            type        : 'browser',
            name        : browser,
            version     : version
        }
    }


    static detect<T extends typeof Environment> (this : T) : InstanceType<T> {
        const instance      = new this() as InstanceType<T>

        instance.initialize(isNodejs() ? instance.detectNodejs() : isDeno() ? instance.detectDeno() : instance.detectBrowser())

        return instance
    }
}
