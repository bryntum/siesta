import { it } from "../../../index.js"
import { CI } from "../../../src/iterator/Iterator.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { delay } from "../../../src/util/Helpers.js"
import { verifyAllFailed } from "../@helpers.js"

//-------------------------------------------------------
it('`waitFor` assertion should work', async t => {

    //------------------
    await t.waitFor(() => true)

    const res = await t.waitFor(async () => {
        await delay(1)
        return 'result'
    })

    t.is(res, 'result', 'Correct result returned from the `waitFor` method')

    //------------------
    t.todo('Should all fail', async t => {

        await t.waitFor({
            condition       : () => false,
            timeout         : 1
        })

    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})


//-------------------------------------------------------
it('`beginAsync/endAsync` assertion should work', async t => {

    t.it('Should be able to chain `beginAsync`', async t => {

        const async = t.beginAsync()

        setTimeout(() => {
            t.endAsync(async)

            // starting a new async gap right after finalization of previous
            const async2 = t.beginAsync()

            setTimeout(() => {
                t.endAsync(async2)

                t.pass("Should reach this line")
            }, 1)
        }, 1)

    }).postFinishHook.on(nestedTest => {
        const assertions    = CI(nestedTest.eachResultOfClassDeep(Assertion)).toArray()

        t.is(assertions.length, 1)

        if (assertions.length > 0) {
            t.true(assertions[ 0 ].passed)
        }
    })

    t.todo('Should all fail', async t => {
        t.beginAsync(1)
    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})


