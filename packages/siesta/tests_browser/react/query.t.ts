import { beforeEach, it } from "../../react.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should support component query', async t => {

    // const clickDiv = document.body.appendChild(createElement('div', {
    //     id      : 'div',
    //     style   : 'width : 50px; height : 50px;',
    //     text    : 'testing 1'
    // }))
    //
    // //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    // const { elapsed : elapsed1 } = await measure(t.waitForEvent(clickDiv, 'click', {
    //     trigger     : async () => { await delay(defaultDelay); t.click(clickDiv) }
    // }))
    //
    // t.isGreaterOrEqual(elapsed1, defaultDelay)
    //
    // //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    // const { elapsed : elapsed2 } = await measure(t.waitForEvent('#div', 'click', {
    //     trigger     : async () => { await delay(defaultDelay); t.click(clickDiv) },
    //     description : 'Should resolve string to element'
    // }))
    //
    // t.isGreaterOrEqual(elapsed2, defaultDelay)
    //
    // //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    // const { elapsed : elapsed3 } = await measure(t.waitForEvent([ 25, 25 ], 'click', {
    //     trigger     : async () => { await delay(defaultDelay); t.click(clickDiv) },
    //     description : 'Should resolve point to element'
    // }))
    //
    // t.isGreaterOrEqual(elapsed3, defaultDelay)

    // //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    // t.todo('Should all fail', async t => {
    //
    //     await t.waitForEvent(clickDiv, 'click', { timeout : 1 })
    //
    // }).postFinishHook.on(todoTest => {
    //     verifyAllFailed(todoTest, t)
    //
    //     t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
    // })
})


