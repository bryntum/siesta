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


it('Launching Node.js test suites should work', async t => {
    await runTestsQueued(t, [
        {
            title       : 'Should be able to launch the Node.js project in Node.js directly',
            launch      : async () => await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js')),
            func        : async (t : TestNodejs, launchRes : LaunchResult) => {
                await verifySampleProjectLaunch(t, launchRes)
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

