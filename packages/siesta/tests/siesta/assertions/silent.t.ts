import { it } from "../../../index.js"
import { CI } from "../../../src/iterator/Iterator.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { verifyAllFailed } from "../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('The passed "silent" assertion should not be included in the log', async t => {

    t.todo('Should all fail', async t => {
        t.silent.is(1, 1)

        t.is(0, 0)

    }).postFinishHook.on(todoTest => {
        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('The failed "silent" assertion should be included in the log', async t => {

    t.todo('Should all fail', async t => {
        t.silent.is(1, 2)

        t.is(0, 1)
    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 2)
    })
})
