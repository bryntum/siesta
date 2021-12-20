import { it } from "../../../index.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to generate source points for failures', async t => {
    t.todo('internal', async t => {
        t.true(false)
    }).postFinishHook.on(todoTest => {
        const assertion     = todoTest.assertions[ 0 ]

        t.true(assertion.sourcePoint)

        if (!assertion.sourcePoint) return

        t.isNumber(assertion.sourcePoint.line)
        t.isNumber(assertion.sourcePoint.char)
    })
})

