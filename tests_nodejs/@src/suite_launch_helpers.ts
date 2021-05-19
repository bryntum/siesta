import child_process from 'child_process'
import path from "path"
import { fileURLToPath } from "url"
import { siestaPackageRootUrl } from "../../index.js"
import { Test } from "../../src/siesta/test/Test.js"

//---------------------------------------------------------------------------------------------------------------------
export const SIESTA_PACKAGE_ROOT_WEB_PATH = process.env.SIESTA_PACKAGE_ROOT_WEB_PATH

//---------------------------------------------------------------------------------------------------------------------
export type LaunchResult    = { exitCode : number, error? : Error, stdout : string, stderr : string }

//---------------------------------------------------------------------------------------------------------------------
export const runProjectDirectly = async (projectUrl : string, options : object = {}, inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-read', '--allow-net', '--allow-env', '--unstable', '--no-check', '--quiet', projectUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ projectUrl, ...stringifyOptions(options), '--no-color' ],
            {
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr })
            }
        )
    })
}


//---------------------------------------------------------------------------------------------------------------------
export const runProjectViaLauncher = async (projectUrl : string, options : object = {}, inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-read', '--allow-net', '--allow-env', '--unstable', '--no-check', '--quiet', `${ fileURLToPath(siestaPackageRootUrl) }bin/siesta-deno.js`, projectUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ `${ fileURLToPath(siestaPackageRootUrl) }bin/siesta.js`, projectUrl, ...stringifyOptions(options), '--no-color' ],
            {
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr })
            }
        )
    })
}


//---------------------------------------------------------------------------------------------------------------------
export const runTestDirectly = async (testUrl : string, options : object = {}, inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-read', '--allow-net', '--allow-env', '--unstable', '--no-check', '--quiet', testUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ testUrl, ...stringifyOptions(options), '--no-color' ],
            {
                cwd         : isHttpUrl(testUrl) ? null : path.dirname(testUrl),
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr })
            }
        )
    })
}


//---------------------------------------------------------------------------------------------------------------------
export const runTestViaLauncher = async (testUrl : string, options : object = {}, inDeno : boolean = false) : Promise<LaunchResult> => {
    return new Promise((resolve, reject) => {

        child_process.execFile(
            inDeno ? 'deno' : 'node',
            inDeno
                ?
                    [ 'run', '--allow-read', '--allow-net', '--allow-env', '--unstable', '--no-check', '--quiet', `deno ${ fileURLToPath(siestaPackageRootUrl) }bin/siesta-deno.js`, testUrl, ...stringifyOptions(options), '--no-color' ]
                :
                    [ `${ fileURLToPath(siestaPackageRootUrl) }bin/siesta.js`, testUrl, ...stringifyOptions(options), '--no-color' ],
            {
                cwd         : isHttpUrl(testUrl) ? null : path.dirname(testUrl),
                encoding    : 'utf8',
                shell       : true
            },
            (error, stdout, stderr) => {
                resolve({ exitCode : error?.code || 0, error, stdout, stderr })
            }
        )
    })
}


//---------------------------------------------------------------------------------------------------------------------
export const verifySampleProjectLaunch = async (t : Test, launchRes : LaunchResult) => {
    t.like(launchRes.stdout, `Launching test suite project:`)

    // the order of tests is not defined
    t.like(launchRes.stdout, `PASS  test_1.t.js`)
    t.like(launchRes.stdout, `PASS  test_2.t.js`)
    t.like(launchRes.stderr, '')

    t.like(launchRes.stdout, `Test files : 2 passed, 0 failed, 2 total`)

    t.is(launchRes.exitCode, 0)
}


//---------------------------------------------------------------------------------------------------------------------
export const verifySampleTestLaunch = async (t : Test, launchRes : LaunchResult) => {
    t.like(launchRes.stdout, `Launching test file:`)

    t.like(launchRes.stdout, /PASS.*test_1\.t\.js/)

    t.like(launchRes.stdout, `Test files : 1 passed, 0 failed, 1 total`)
    t.like(launchRes.stderr, '')

    t.is(launchRes.exitCode, 0)
}


//---------------------------------------------------------------------------------------------------------------------
const stringifyOptions = (options : object) : string[] =>
    Object.entries(options).map(([ key, value ]) => `${ key.replace(/^(--)?/, '--') }='${ value }'`)


//---------------------------------------------------------------------------------------------------------------------
const isHttpUrl = (urlOrPath : string) : boolean => /https?:/i.test(urlOrPath)
