import { startDevServer } from "@web/dev-server"
import { StartDevServerParams } from "@web/dev-server/dist/startDevServer.js"
import child_process from 'child_process'
import path from "path"
import { fileURLToPath } from "url"
import { siestaPackageRootUrl } from "../../index.js"
import { Queue } from "../../src/siesta/launcher/Queue.js"
import { Test } from "../../src/siesta/test/Test.js"
import { UnwrapPromise } from "../../src/util/Helpers.js"
import { isString, isArray } from "../../src/util/Typeguards.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type LaunchResult    = { exitCode : number, error? : Error, stdout : string, stderr : string, options : CmdOptions }

type CmdOptions = string[]


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const runProjectDirectly = async (projectUrl : string, options : CmdOptions = [], inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-all', '--unstable', '--no-check', '--quiet', projectUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ projectUrl, ...stringifyOptions(options), '--no-color' ],
            {
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr, options })
            }
        )
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const runProjectViaLauncher = async (projectUrl : string, options : CmdOptions = [], inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-all', '--unstable', '--no-check', '--quiet', `${ fileURLToPath(siestaPackageRootUrl) }bin/siesta_deno.js`, projectUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ `${ fileURLToPath(siestaPackageRootUrl) }bin/siesta.js`, projectUrl, ...stringifyOptions(options), '--no-color' ],
            {
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr, options })
            }
        )
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const runTestDirectly = async (testUrl : string, options : CmdOptions = [], inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-all', '--unstable', '--no-check', '--quiet', testUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ testUrl, ...stringifyOptions(options), '--no-color' ],
            {
                cwd         : isHttpUrl(testUrl) ? null : path.dirname(testUrl),
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr, options })
            }
        )
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const runTestViaLauncher = async (testUrl : string, options : CmdOptions = [], inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-all', '--unstable', '--no-check', '--quiet', `deno ${ fileURLToPath(siestaPackageRootUrl) }bin/siesta_deno.js`, testUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ `${ fileURLToPath(siestaPackageRootUrl) }bin/siesta.js`, testUrl, ...stringifyOptions(options), '--no-color' ],
            {
                cwd         : isHttpUrl(testUrl) ? null : path.dirname(testUrl),
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr, options })
            }
        )
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const verifySampleProjectLaunch = async (t : Test, launchRes : LaunchResult) => {
    t.like(launchRes.stdout, `Launching test suite project:`)

    // the order of tests is not defined
    t.like(launchRes.stdout, `PASS  test_1.t.js`)
    t.like(launchRes.stdout, `PASS  test_2.t.js`)
    t.is(launchRes.stderr, '')

    t.like(launchRes.stdout, `Test files : 2 passed, 0 failed, 2 total`)

    t.is(launchRes.exitCode, 0)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const verifySampleTestLaunch = async (t : Test, launchRes : LaunchResult) => {
    t.like(launchRes.stdout, `Launching test file:`)

    t.like(launchRes.stdout, /PASS.*test_1\.t\.js/)

    t.like(launchRes.stdout, `Test files : 1 passed, 0 failed, 1 total`)
    t.is(launchRes.stderr, '')

    t.is(launchRes.exitCode, 0)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const stringifyOptions = (options : CmdOptions) : string[] => {
    if (isArray(options)) {
        return options
    } else {
        return Object.entries(options).map(([ key, value ]) => `${ key.replace(/^(--)?/, '--') }='${ value }'`)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isHttpUrl = (urlOrPath : string) : boolean => /https?:/i.test(urlOrPath)


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const launchWebServer = async (options : StartDevServerParams = {}) : Promise<{ server : UnwrapPromise<ReturnType<typeof startDevServer>>, port : number }> => {
    const server    = await startDevServer(Object.assign({
        config : {
            nodeResolve : true
        },
        logStartMessage     : false
    }, options))

    const address           = server.server.address()
    const port              = !isString(address) ? address.port : undefined

    return { server, port }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type TestSuiteLaunchDesc = {
    title       : string
    launch      : () => Promise<LaunchResult>
    func        : (t : Test, launchRes : LaunchResult) => Promise<unknown>
}

export const runTestsQueued = async (t : Test, tests : TestSuiteLaunchDesc[], workers : number = 5) : Promise<void> => {
    const queue     = Queue.new({ maxWorkers : workers })

    queue.onFreeSlotAvailableHook.on(() => {
        const test      = tests.shift()

        if (test) queue.push(test, test.launch())
    })

    queue.onSlotSettledHook.on((queue, test : TestSuiteLaunchDesc, settledRes : PromiseSettledResult<LaunchResult>) => {
        t.it(test.title, async t => {
            await test.func(t, settledRes.status === 'fulfilled' ? settledRes.value : undefined)
        })

        queue.pull()
    })

    queue.pull()

    await new Promise(resolve => queue.onCompletedHook.on(resolve))
}
