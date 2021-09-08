import { CI } from "../../../../chained-iterator"
import { it } from "../../../browser.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"
import { createElement } from "../../@helpers.js"

//-------------------------------------------------------
it('`waitForEvent` assertion should work', async t => {

    const clickDiv = document.body.appendChild(createElement(document, 'div', {
        id      : 'div',
        style   : 'width : 40px;',
        text    : 'testing'
    }))

    await t.waitForEvent(clickDiv, 'click', { trigger : () => clickDiv.click() })

    await t.waitForEvent('#div', 'click', { trigger : () => clickDiv.click(), description : 'Should resolve string to element' })

    await t.waitForEvent([ 100, 100 ], 'click', { trigger : () => document.body.click(), description : 'Should resolve point to element' })

    //------------------
    t.todo('Should all fail', async t => {

        await t.waitForEvent(clickDiv, 'click', { timeout : 1 })

    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})
