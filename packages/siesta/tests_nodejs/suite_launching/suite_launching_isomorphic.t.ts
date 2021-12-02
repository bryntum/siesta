import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import { it, TestNodejs } from "../../nodejs.js"
import {
    LaunchResult,
    launchWebServer,
    runProjectDirectly,
    runProjectViaLauncher,
    runTestDirectly, runTestsQueued,
    verifySampleProjectLaunch,
    verifySampleTestLaunch
} from "../@src/suite_launch_helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)
const tmpDir        = os.tmpdir()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Launching isomorphic tests in Node.js should work', async t => {
    await runTestsQueued(t, [
        {
            title       : 'Should be able to launch the isomorphic project in Node.js directly',
            launch      : async () => await runProjectDirectly(
                path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'),
                [
                    '--report-format', 'json',
                    '--report-file', `${ tmpDir }/siesta/${ Math.random() }.json`,
                    '--report-format', 'junit',
                    '--report-file', `${ tmpDir }/siesta/${ Math.random() }.xml`,
                    '--report-format', 'html',
                    '--report-file', `${ tmpDir }/siesta/html-report-${ Math.random() }`,
                ]
            ),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleProjectLaunch(t, launchRes)

                const options       = launchRes.options

                t.true(fs.existsSync(options[ 3 ]), `File ${ options[ 3 ] } exists`)
                t.true(fs.existsSync(options[ 7 ]), `File ${ options[ 7 ] } exists`)
                t.true(fs.existsSync(options[ 11 ]), `File ${ options[ 11 ] } exists`)
                t.true(fs.existsSync(`${ options[ 11 ] }/report_data.json`), `File ${ options[ 11 ] }/report_data.json exists`)
                t.true(fs.existsSync(`${ options[ 11 ] }/index.html`), `File ${ options[ 11 ] }/index.html exists`)
                t.true(fs.existsSync(`${ options[ 11 ] }/index.js`), `File ${ options[ 11 ] }/index.js exists`)
            }
        },
        {
            title       : 'Should be able to launch the isomorphic project in Node.js via launcher',
            launch      : async () => await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleProjectLaunch(t, launchRes)
            }
        },
        {
            title       : 'Should be able to launch the isomorphic test file in Node.js directly',
            launch      : async () => await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/test_1.t.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleTestLaunch(t, launchRes)
            }
        },
        {
            title       : 'Should be able to launch the isomorphic test file in Node.js via launcher',
            launch      : async () => await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomorphic/test_1.t.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleTestLaunch(t, launchRes)
            }
        },
        {
            title       : 'Should be able to launch the isomorphic test file in Node.js via launcher with glob',
            launch      : async () => await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomo*/t*t_1.t.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleTestLaunch(t, launchRes)
            }
        },
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Deno tests can run only in bundled build
if (process.env.BUNDLED) {

    it('Should be able to launch the isomorphic project in Deno directly', async t => {
        const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'), [], true)

        await verifySampleProjectLaunch(t, launchRes)
    })


    it('Should be able to launch the isomorphic project in Deno via launcher', async t => {
        const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'), [], true)

        await verifySampleProjectLaunch(t, launchRes)
    })


    it('Should be able to launch the isomorphic test file in Deno directly', async t => {
        const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/test_1.t.js'), [], true)

        await verifySampleTestLaunch(t, launchRes)
    })

    it('Should be able to launch the isomorphic test file in Deno via launcher', async t => {
        const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomorphic/test_1.t.js'), [], true)

        await verifySampleTestLaunch(t, launchRes)
    })

    it('Should be able to launch the isomorphic test file in Deno via launcher with glob', async t => {
        const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomo*/t*t_1.t.js'), [], true)

        await verifySampleTestLaunch(t, launchRes)
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to launch the isomorphic project in browser via launcher', async t => {
    const { server, port } = await launchWebServer({ argv : [ '--root-dir', `${ __dirname }/../..` ] })

    const launchRes     = await runProjectViaLauncher(
        `http://localhost:${ port }/tests_nodejs/@sample_test_suites/isomorphic/index.js`
    )

    await verifySampleProjectLaunch(t, launchRes)

    await server.stop()
})
