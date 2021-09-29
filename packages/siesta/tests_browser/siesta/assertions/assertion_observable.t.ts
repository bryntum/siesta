import { CI } from "../../../../chained-iterator"
import { it } from "../../../browser.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { delay, measure } from "../../../src/util/TimeHelpers.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"
import { createElement } from "../../@helpers.js"

const defaultDelay = 50

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`waitForEvent` assertion should work', async t => {

    const clickDiv = document.body.appendChild(createElement('div', {
        id      : 'div',
        style   : 'width : 50px; height : 50px;',
        text    : 'testing 1'
    }))

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const { elapsed : elapsed1 } = await measure(t.waitForEvent(clickDiv, 'click', {
        trigger     : async () => { await delay(defaultDelay); t.click(clickDiv) }
    }))

    t.isGreaterOrEqual(elapsed1, defaultDelay)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const { elapsed : elapsed2 } = await measure(t.waitForEvent('#div', 'click', {
        trigger     : async () => { await delay(defaultDelay); t.click(clickDiv) },
        description : 'Should resolve string to element'
    }))

    t.isGreaterOrEqual(elapsed2, defaultDelay)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const { elapsed : elapsed3 } = await measure(t.waitForEvent([ 25, 25 ], 'click', {
        trigger     : async () => { await delay(defaultDelay); t.click(clickDiv) },
        description : 'Should resolve point to element'
    }))

    t.isGreaterOrEqual(elapsed3, defaultDelay)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    t.todo('Should all fail', async t => {

        await t.waitForEvent(clickDiv, 'click', { timeout : 1 })

    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`firesOk` assertion should work', async t => {

    const clickDiv = document.body.appendChild(createElement('div', {
        id      : 'div2',
        style   : 'width : 50px;',
        text    : 'testing 2'
    }))

    await t.firesOk({
        observable  : '#div2',
        events      : { click : 1, mick : 0 },
        during      : async () => await t.click(clickDiv)
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    t.todo('Should all fail', async t => {

        t.firesOk({
            observable  : '#div2',
            events      : { click : 0, mick : 1 },
            during      : async () => await t.click(clickDiv)
        })

    }).postFinishHook.on(todoTest => {
        verifyAllFailed(todoTest, t)

        t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    })
})
