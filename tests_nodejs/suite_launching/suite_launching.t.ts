import path from "path"
import { fileURLToPath } from "url"
import { iit, it } from "../../nodejs.js"
import {
    runProjectDirectly,
    runProjectViaLauncher,
    runTestDirectly, runTestViaLauncher, SIESTA_PACKAGE_ROOT_WEB_PATH,
    verifySampleProjectLaunch,
    verifySampleTestLaunch
} from "../@src/suite_launch_helpers.js"

//---------------------------------------------------------------------------------------------------------------------
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to launch the isomorphic project in Node.js directly', async t => {
    const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'))

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the isomorphic project in Node.js via launcher', async t => {
    const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'))

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the isomorphic test file in Node.js directly', async t => {
    const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/test_1.t.js'))

    await verifySampleTestLaunch(t, launchRes)
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to launch the isomorphic project in Deno directly', async t => {
    const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'), {}, true)

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the isomorphic project in Deno via launcher', async t => {
    const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/isomorphic/index.js'), {}, true)

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the isomorphic test file in Deno directly', async t => {
    const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/isomorphic/test_1.t.js'), {}, true)

    await verifySampleTestLaunch(t, launchRes)
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to launch the isomorphic project in browser via launcher', async t => {
    const launchRes     = await runProjectViaLauncher(
        `${ SIESTA_PACKAGE_ROOT_WEB_PATH }/tests_nodejs/@sample_test_suites/isomorphic/index.js`
    )

    await verifySampleProjectLaunch(t, launchRes)
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to launch the Node.js project in Node.js directly', async t => {
    const launchRes     = await runProjectDirectly(path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js'))

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the Node.js project in Node.js via launcher', async t => {
    const launchRes     = await runProjectViaLauncher(path.resolve(__dirname, '../@sample_test_suites/nodejs/index.js'))

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the Node.js test file in Node.js directly', async t => {
    const launchRes     = await runTestDirectly(path.resolve(__dirname, '../@sample_test_suites/nodejs/test_1.t.js'))

    await verifySampleTestLaunch(t, launchRes)
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to launch the browser project in browser via launcher', async t => {
    const launchRes     = await runProjectViaLauncher(
        `${ SIESTA_PACKAGE_ROOT_WEB_PATH }/tests_nodejs/@sample_test_suites/browser/index.js`
    )

    await verifySampleProjectLaunch(t, launchRes)
})


it('Should be able to launch the browser test file in browser via launcher', async t => {
    const launchRes     = await runTestViaLauncher(
        `${ SIESTA_PACKAGE_ROOT_WEB_PATH }/tests_nodejs/@sample_test_suites/browser/test_1.t.js`
    )

    await verifySampleTestLaunch(t, launchRes)
})
