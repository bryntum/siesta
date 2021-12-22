import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import { it, TestNodejs } from "../../nodejs.js"
import { ExitCodes } from "../../src/siesta/launcher/Types.js"
import {
    LaunchResult,
    launchWebServer,
    runProjectDirectly,
    runProjectViaLauncher,
    runTestDirectly,
    runTestsQueued,
    runTestViaLauncher,
    verifySampleProjectLaunch,
    verifySampleTestLaunch
} from "../@src/suite_launch_helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)

const tmpDir        = os.tmpdir()

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Launching browser tests should work', async t => {
    const { server, port } = await launchWebServer({ argv : [ '--root-dir', `${ __dirname }/../..` ] })

    await runTestsQueued(t, [
        {
            title       : 'Should be able to launch the browser project in browser via launcher and generate reports',
            launch      : async () => {
                return await runProjectViaLauncher(
                    `http://localhost:${port}/tests_nodejs/@sample_test_suites/browser/index.js`,
                    [
                        '--report-format', 'json',
                        '--report-file', `${ tmpDir }/siesta/${ Math.random() }.json`,
                        '--report-format', 'junit',
                        '--report-file', `${ tmpDir }/siesta/${ Math.random() }.xml`,
                        '--report-format', 'html',
                        '--report-file', `${ tmpDir }/siesta/html-report-${ Math.random() }`,
                    ]
                )
            },
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleProjectLaunch(t, launchRes)

                const options       = launchRes.options

                t.true(fs.existsSync(options[ 3 ]), `File ${ options[ 3 ] } exists`)
                t.true(fs.existsSync(options[ 7 ]), `File ${ options[ 7 ] } exists`)
                t.true(fs.existsSync(options[ 11 ]), `File ${ options[ 11 ] } exists`)
                t.true(fs.existsSync(`${ options[ 11 ] }/report_data.json`), `File ${ options[ 11 ] }/report_data.json exists`)
                t.true(fs.existsSync(`${ options[ 11 ] }/index.html`), `File ${ options[ 11 ] }/index.html exists`)
                t.true(fs.existsSync(`${ options[ 11 ] }/dist`), `File ${ options[ 11 ] }/dist exists`)
            }
        },
        {
            title       : 'Should be able to launch the browser test file in browser via launcher',
            launch      : async () => await runTestViaLauncher(
                `http://localhost:${ port }/tests_nodejs/@sample_test_suites/browser/test_1.t.js`
            ),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleTestLaunch(t, launchRes)
            }
        },
        {
            title       : 'When launching browser project directly in node should provide a meaningful error message',
            launch      : async () => await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/browser/index.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                t.is(launchRes.exitCode, ExitCodes.INCORRECT_ENVIRONMENT)

                t.like(
                    launchRes.stdout,
                    'Browser project launched directly as Node.js script'
                )
            }
        },
        {
            title       : 'When launching browser test directly in node should provide a meaningful error message',
            launch      : async () => await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/browser/test_1.t.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                t.is(launchRes.exitCode, ExitCodes.INCORRECT_ENVIRONMENT)

                t.like(
                    launchRes.stdout,
                    'Browser test launched directly as Node.js script'
                )
            }
        }
    ])

    await server.stop()
})