import path from "path"
import { fileURLToPath } from "url"
import { it } from "../../nodejs.js"
import { ExitCodes } from "../../src/siesta/launcher/Types.js"
import {
    launchWebServer,
    runProjectDirectly,
    runProjectViaLauncher,
    runTestDirectly,
    runTestViaLauncher,
    verifySampleProjectLaunch,
    verifySampleTestLaunch
} from "../@src/suite_launch_helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)

// TODO refactor this test to launch the individual cases in parallel


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to launch the browser project in browser via launcher', async t => {
    const { server, port } = await launchWebServer({ argv : [ '--root-dir', `${ __dirname }/../..` ] })

    const launchRes     = await runProjectViaLauncher(
        `http://localhost:${ port }/tests_nodejs/@sample_test_suites/browser/index.js`
    )

    await verifySampleProjectLaunch(t, launchRes)

    await server.stop()
})


it('Should be able to launch the browser test file in browser via launcher', async t => {
    const { server, port } = await launchWebServer({ argv : [ '--root-dir', `${ __dirname }/../..` ] })

    const launchRes     = await runTestViaLauncher(
        `http://localhost:${ port }/tests_nodejs/@sample_test_suites/browser/test_1.t.js`
    )

    await verifySampleTestLaunch(t, launchRes)

    await server.stop()
})


it('When launching browser project directly in node should provide a meaningful error message', async t => {
    const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/browser/index.js'))

    t.is(launchRes.exitCode, ExitCodes.INCORRECT_ENVIRONMENT)

    t.like(
        launchRes.stdout,
        'Browser project launched directly as Node.js script'
    )
})


it('When launching browser test directly in node should provide a meaningful error message', async t => {
    const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/browser/test_1.t.js'))

    t.is(launchRes.exitCode, ExitCodes.INCORRECT_ENVIRONMENT)

    t.like(
        launchRes.stdout,
        'Browser test launched directly as Node.js script'
    )
})
