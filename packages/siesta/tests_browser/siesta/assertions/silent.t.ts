import { it } from "../../../browser.js"
import { CI } from "../../../src/iterator/Iterator.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('The asynchronous passed "silent" assertion should not be included in the log', async t => {

    t.todo('Should all fail', async t => {
        t.silent.firesOk(document.body, 'click', 1)

        // intentionally failed, so that even if the "silent" flag from previous assertion
        // is kept by the implementation this assertiojn will still be added to log
        // (and flag reset)
        t.is(1, 2)

        await t.click('body', [ 5, 5 ])

    }).postFinishHook.on(todoTest => {
        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('The asynchronous failed "silent" assertion should be included in the log', async t => {

    t.todo('Should all fail', async t => {
        t.silent.firesOk(document.body, 'click', 2)

        t.is(1, 2)

    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 2)
    })
})
