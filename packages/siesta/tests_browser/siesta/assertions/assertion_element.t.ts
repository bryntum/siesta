// import { CI } from "chained-iterator"
// import { it } from "../../../browser.js"
// import { Assertion } from "../../../src/siesta/test/TestResult.js"
// import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"
// import { createElement } from "../../@helpers.js"
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('`waitForEvent` assertion should work', async t => {
//
//     const clickDiv = document.body.appendChild(createElement('div', {
//         id      : 'div',
//         style   : 'width : 40px;',
//         text    : 'testing 1'
//     }))
//
//     await t.waitForEvent(clickDiv, 'click', { trigger : () => t.click(clickDiv) })
//
//     await t.waitForEvent('#div', 'click', { trigger : () => t.click(clickDiv), description : 'Should resolve string to element' })
//
//     await t.waitForEvent([ 100, 100 ], 'click', { trigger : () => t.click(document.body), description : 'Should resolve point to element' })
//
//     //------------------
//     t.todo('Should all fail', async t => {
//
//         await t.waitForEvent(clickDiv, 'click', { timeout : 1 })
//
//     }).postFinishHook.on(todoTest => {
//         verifyAllFailed(todoTest, t)
//
//         t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
//     })
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('`firesOk` assertion should work', async t => {
//
//     const clickDiv = document.body.appendChild(createElement('div', {
//         id      : 'div2',
//         style   : 'width : 40px;',
//         text    : 'testing 2'
//     }))
//
//     await t.firesOk({
//         observable  : '#div2',
//         events      : { click : 1, mick : 0 },
//         during      : async () => await t.click(clickDiv)
//     })
//
//
//     //------------------
//     t.todo('Should all fail', async t => {
//
//         t.firesOk({
//             observable  : '#div2',
//             events      : { click : 0, mick : 1 },
//             during      : async () => await t.click(clickDiv)
//         })
//
//     }).postFinishHook.on(todoTest => {
//         verifyAllFailed(todoTest, t)
//
//         t.is(CI(todoTest.eachResultOfClassDeep(Assertion)).size, 1)
//     })
// })
