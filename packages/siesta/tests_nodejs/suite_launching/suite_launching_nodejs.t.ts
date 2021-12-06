import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import { it, TestNodejs } from "../../nodejs.js"
import {
    LaunchResult,
    runProjectDirectly,
    runProjectViaLauncher,
    runTestDirectly,
    runTestsQueued,
    verifySampleProjectLaunch,
    verifySampleTestLaunch
} from "../@src/suite_launch_helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)
const tmpDir        = os.tmpdir()

it('Launching Node.js test suites should work', async t => {
    await runTestsQueued(t, [
        {
            title       : 'Should be able to launch the Node.js project in Node.js directly and generate reports',
            launch      : async () => await runProjectDirectly(
                path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js'),
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
                t.true(fs.existsSync(`${ options[ 11 ] }/dist`), `File ${ options[ 11 ] }/dist exists`)
            }
        },
        {
            title       : 'Should be able to launch the Node.js project in Node.js via launcher',
            launch      : async () => await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleProjectLaunch(t, launchRes)
            }
        },
        {
            title       : 'Should be able to launch the Node.js test file in Node.js directly',
            launch      : async () => await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/nodejs/test_1.t.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleTestLaunch(t, launchRes)
            }
        }
    ])
})

