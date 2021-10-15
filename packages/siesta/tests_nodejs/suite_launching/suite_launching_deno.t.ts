import path from "path"
import { fileURLToPath } from "url"
import { it } from "../../nodejs.js"
import {
    runProjectDirectly,
    runProjectViaLauncher,
    runTestDirectly,
    verifySampleProjectLaunch,
    verifySampleTestLaunch
} from "../@src/suite_launch_helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)

// TODO refactor this test to launch the individual cases in parallel

// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Should be able to launch the Node.js project in Node.js directly', async t => {
//     const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js'))
//
//     await verifySampleProjectLaunch(t, launchRes)
// })
//
//
// it('Should be able to launch the Node.js project in Node.js via launcher', async t => {
//     const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js'))
//
//     await verifySampleProjectLaunch(t, launchRes)
// })
//
//
// it('Should be able to launch the Node.js test file in Node.js directly', async t => {
//     const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/nodejs/test_1.t.js'))
//
//     await verifySampleTestLaunch(t, launchRes)
// })
//
//
