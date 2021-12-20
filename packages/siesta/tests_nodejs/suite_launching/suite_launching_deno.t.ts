import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import { it, TestNodejs } from "../../nodejs.js"
import {
    LaunchResult,
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
if (process.env.BUNDLED) {

    it('Should be able to launch the Deno project in Deno directly', async t => {
        await runTestsQueued(t, [
            {
                title       : 'Should be able to launch the Deno project in Deno directly and generate reports',
                launch      : async () => await runProjectDirectly(
                    path.resolve(__dirname, '../@sample_test_suites/deno/index.js'),
                    [
                        '--report-format', 'json',
                        '--report-file', `${ tmpDir }/siesta/${ Math.random() }.json`,
                        '--report-format', 'junit',
                        '--report-file', `${ tmpDir }/siesta/${ Math.random() }.xml`,
                        '--report-format', 'html',
                        '--report-file', `${ tmpDir }/siesta/html-report-${ Math.random() }`,
                    ],
                    true
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
                title       : 'Should be able to launch the Deno project in Deno via launcher',
                launch      : async () => await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/deno/index.js'), [], true),
                func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                    await verifySampleProjectLaunch(t, launchRes)
                }
            },
            {
                title       : 'Should be able to launch the Deno test file in Deno directly',
                launch      : async () => await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/deno/test_1.t.js'), [], true),
                func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                    await verifySampleTestLaunch(t, launchRes)
                }
            }
        ])
    })
}
