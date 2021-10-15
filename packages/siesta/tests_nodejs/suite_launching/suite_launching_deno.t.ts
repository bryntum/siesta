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

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (process.env.BUNDLED) {

    it('Should be able to launch the Deno project in Deno directly', async t => {
        const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/deno/index.js'), {}, true)

        await verifySampleProjectLaunch(t, launchRes)
    })


    it('Should be able to launch the Deno project in Deno via launcher', async t => {
        const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/deno/index.js'), {}, true)

        await verifySampleProjectLaunch(t, launchRes)
    })


    it('Should be able to launch the Deno test file in Deno directly', async t => {
        const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/deno/test_1.t.js'), {}, true)

        await verifySampleTestLaunch(t, launchRes)
    })
}
