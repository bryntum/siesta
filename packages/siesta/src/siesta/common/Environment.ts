import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Serializable, serializable } from "../../serializable/Serializable.js"
import { isDeno, isNodejs } from "../../util/Helpers.js"
import { isArray, isFunction, isRegExp } from "../../util/Typeguards.js"

/*
    Based on the Bowser code, MIT licensed:
    https://github.com/lancedikson/bowser/blob/959082b45d429ce1ed91fbe66f7d2313ff5d7f2a/LICENSE
*/

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const Environments = {
    isomorphic      : 'Isomorphic',
    browser         : 'Browser',
    nodejs          : 'Node.js',
    deno            : 'Deno',
}

export type EnvironmentType = keyof typeof Environments


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const OperationSystems = {
    linux           : 'Linux',
    macos           : 'macOS',
    windows         : 'Windows',
    ios             : 'iOS',
    android         : 'Android',
}

export type OperationSystemType = keyof typeof OperationSystems


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const Browsers = {
    chrome          : 'Chrome',
    firefox         : 'Firefox',
    safari          : 'Safari',
    edge            : 'Edge'
}

export type BrowserType = keyof typeof Browsers


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const RenderingEngines = {
    blink           : 'Blink',
    gecko           : 'Gecko',
    webkit          : 'Webkit'
}

export type RenderingEngineType = keyof typeof RenderingEngines


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class EnvironmentPre extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class EnvironmentPre extends base {
    }
){}


@serializable({ id : 'Environment' })
export class Environment extends EnvironmentPre {
    type            : EnvironmentType       = 'isomorphic'
    // human-readable environment name
    name            : string                = ''
    version         : string                = ''

    os              : OperationSystemType   = undefined
    osName          : string                = undefined
    osVersion       : string                = undefined
    osVersionName   : string                = undefined

    browser         : BrowserType           = undefined
    browserName     : string                = undefined

    engine          : RenderingEngineType   = undefined
    engineName      : string                = undefined
    engineVersion   : string                = undefined


    get isMac () : boolean {
        return this.os === 'macos'
    }


    get isWindow () : boolean {
        return this.os === 'windows'
    }


    get isLinux () : boolean {
        return this.os === 'linux'
    }


    detectDeno () : Partial<Environment> {
        return {
            type        : 'deno',
            name        : 'Deno',
            version     : globalThis.Deno.version.deno
        }
    }


    detectNodejs () : Partial<Environment> {
        let os : OperationSystemType    = undefined

        switch (process.platform) {
            case "win32"    : os = 'windows'; break
            case "darwin"   : os = 'macos'; break
            case "linux"    : os = 'linux'; break
        }

        return {
            type        : 'nodejs',
            name        : 'Node.js',
            os,
            version     : process.version
        }
    }

    detectBrowser () : Partial<Environment> {
        const uaString      = navigator.userAgent

        let browser : BrowserType   = undefined
        let version : string        = ''

        let match

        if (match = /Edg\/(\d+(\.\d+)*)/i.exec(uaString)) {
            browser     = "edge"
            version     = match[ 1 ]
        }
        else if (match = /Firefox\/((?:\d+\.?)+)/.exec(uaString)) {
            browser     = "firefox"
            version     = match[ 1 ]
        }
        else if (match = /Chrome\/((?:\d+\.?)+)/.exec(uaString)) {
            browser     = "chrome"
            version     = match[ 1 ]
        }
        else if (match = /Apple.*Version\/((?:\d+\.?)+)\s*(?=Safari\/((?:\d+\.?)+))/.exec(uaString)) {
            browser     = "safari"
            version     = match[ 1 ] + ' (' + match[ 2 ] + ')'
        }

        const osDetection       = detectBrowserOS(uaString)
        const engineDetection   = detectRenderingEngine(uaString)

        return {
            type            : 'browser',
            name            : Browsers[ browser ],
            version,

            browser,
            browserName     : Browsers[ browser ],

            os              : osDetection.os,
            osName          : OperationSystems[ osDetection.os ],
            osVersionName   : osDetection.name,
            osVersion       : osDetection.version,

            engine          : engineDetection.engine,
            engineName      : RenderingEngines[ engineDetection.engine ],
            engineVersion   : engineDetection.version
        }
    }


    static detect<T extends typeof Environment> (this : T) : InstanceType < T > {
        const instance      = new this() as InstanceType<T>

        instance.initialize(isNodejs() ? instance.detectNodejs() : isDeno() ? instance.detectDeno() : instance.detectBrowser())

        return instance
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getFirstMatch = (regexp : RegExp, text : string) : string | undefined => {
    const match = text.match(regexp)

    return match && match[ 1 ] || undefined
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getWindowsVersionName = (version : string) : string => {
    switch (version) {
        case 'NT': return 'NT'
        case 'XP': return 'XP'
        case 'NT 5.0': return '2000'
        case 'NT 5.1': return 'XP'
        case 'NT 5.2': return '2003'
        case 'NT 6.0': return 'Vista'
        case 'NT 6.1': return '7'
        case 'NT 6.2': return '8'
        case 'NT 6.3': return '8.1'
        case 'NT 10.0': return '10'
        default: return undefined
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getMacOSVersionName = (version : string) : string => {
    const v = version.split('.').splice(0, 2).map(s => parseInt(s, 10) || 0)

    v.push(0)

    if (v[0] !== 10) return undefined

    switch (v[1]) {
        case 5: return 'Leopard'
        case 6: return 'Snow Leopard'
        case 7: return 'Lion'
        case 8: return 'Mountain Lion'
        case 9: return 'Mavericks'
        case 10: return 'Yosemite'
        case 11: return 'El Capitan'
        case 12: return 'Sierra'
        case 13: return 'High Sierra'
        case 14: return 'Mojave'
        case 15: return 'Catalina'
        default: return undefined
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getAndroidVersionName = (version : string) : string => {
    const v = version.split('.').splice(0, 2).map(s => parseInt(s, 10) || 0)

    v.push(0)

    if (v[0] === 1 && v[1] < 5) return undefined
    if (v[0] === 1 && v[1] < 6) return 'Cupcake'
    if (v[0] === 1 && v[1] >= 6) return 'Donut'
    if (v[0] === 2 && v[1] < 2) return 'Eclair'
    if (v[0] === 2 && v[1] === 2) return 'Froyo'
    if (v[0] === 2 && v[1] > 2) return 'Gingerbread'
    if (v[0] === 3) return 'Honeycomb'
    if (v[0] === 4 && v[1] < 1) return 'Ice Cream Sandwich'
    if (v[0] === 4 && v[1] < 4) return 'Jelly Bean'
    if (v[0] === 4 && v[1] >= 4) return 'KitKat'
    if (v[0] === 5) return 'Lollipop'
    if (v[0] === 6) return 'Marshmallow'
    if (v[0] === 7) return 'Nougat'
    if (v[0] === 8) return 'Oreo'
    if (v[0] === 9) return 'Pie'

    return undefined
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type OSDescriptor   = { os : OperationSystemType, name : string, version : string }

type OSTester = {
    test            : RegExp | RegExp[] | ((ua : string) => boolean)
    describe        : (ua : string) => OSDescriptor
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const detectBrowserOS = (ua : string) : OSDescriptor => {
    const testers : OSTester[] = [
        /* Linux */
        {
            test : /linux/i,
            describe (ua : string) : OSDescriptor {
                return {
                    os          : 'linux',
                    name        : undefined,
                    version     : undefined
                }
            }
        },

        /* Windows */
        {
            test : /windows /i,
            describe (ua : string) : OSDescriptor {
                const version   = getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua)

                return {
                    os          : 'windows',
                    name        : getWindowsVersionName(version),
                    version
                }
            }
        },

        /* macOS */
        {
            test : /macintosh/i,
            describe (ua : string) : OSDescriptor {
                const version = getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua).replace(/[_\s]/g, '.')

                return {
                    os          : 'macos',
                    name        : getMacOSVersionName(version),
                    version
                }
            }
        },

        /* iOS */
        {
            test : /(ipod|iphone|ipad)/i,
            describe (ua : string) : OSDescriptor {
                return {
                    os          : "ios",
                    name        : undefined,
                    version     : getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua).replace(/[_\s]/g, '.')
                }
            }
        },

        /* Android */
        {
            test (ua : string) : boolean {
                // should just use a look behind assertion?
                const notLikeAndroid    = !/like android/i.test(ua)
                const butAndroid        = /android/i.test(ua)

                return notLikeAndroid && butAndroid
            },
            describe (ua : string) : OSDescriptor {
                const version = getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua)

                return {
                    os          : "android",
                    name        : getAndroidVersionName(version),
                    version
                }
            }
        },
    ]

    for (const tester of testers) {
        const test      = tester.test

        if (isRegExp(test) && test.test(ua) || isArray(test) && test.every(regexp => regexp.test(ua)) || isFunction(test) && test(ua)) {
            return tester.describe(ua)
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type EngineDescriptor   = { engine : RenderingEngineType, version : string }

type EngineTester = {
    test            : RegExp
    describe        : (ua : string) => EngineDescriptor
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const detectRenderingEngine = (ua : string) : EngineDescriptor => {

    const testers : EngineTester[] = [
        /* Gecko */
        {
            test : /(?<!like )gecko/i,
            describe (ua : string) : EngineDescriptor {
                return {
                    engine      : 'gecko',
                    version     : getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua)
                }
            }
        },

        /* Blink */
        {
            test : /(apple)?webkit\/537\.36/i,
            describe (ua : string) : EngineDescriptor {
                return {
                    engine      : 'blink',
                    version     : undefined
                }
            }
        },

        /* WebKit */
        {
            test : /(apple)?webkit/i,
            describe (ua : string) : EngineDescriptor {
                return {
                    engine      : 'webkit',
                    version     : getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua)
                }
            }
        }
    ]

    for (const tester of testers) {
        if (tester.test.test(ua)) return tester.describe(ua)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const env = Environment.detect()
