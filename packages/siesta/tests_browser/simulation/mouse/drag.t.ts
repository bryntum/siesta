import { beforeEach, it } from "../../../browser.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"
import { createElement } from "../../@helpers.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Left click', async t => {
//     const clickDiv = document.body.appendChild(createElement('div', {
//         style   : 'width : 40px;',
//         text    : 'testing click'
//     }))
//
//     t.willFireNTimes(clickDiv, 'mousedown', 1,  'left click is ok #1')
//     t.willFireNTimes(clickDiv, 'mouseup', 1,  'left click is ok #2')
//     t.willFireNTimes(clickDiv, 'click', 1,  'left click is ok #3')
//
//     clickDiv.addEventListener('mousedown', event => {
//         t.is(event.button, 0, 'button to 0 for left click')
//
//         // Siesta5 comment: IE and Safari does not support "event.buttons" property
//         // but according to MDN Safari supports it since 11.1
//         t.is(event.buttons, 1, 'buttons to 1 for left click')
//     })
//
//     clickDiv.addEventListener('mouseup', event => {
//         t.is(event.button, 0, 'button to 0 for left click')
//         t.is(event.buttons, 0, 'buttons to 0 for left click')
//     })
//
//     clickDiv.addEventListener('click', event => {
//         t.is(event.button, 0, 'button to 0 for left click')
//         t.is(event.buttons, 0, 'buttons to 0 for left click')
//     })
//
//     await t.click(clickDiv)
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Right click', async t => {
//     const div   = document.body.appendChild(createElement('div', {
//         style   : 'width : 40px; background: yellow;',
//         text    : 'testing right click'
//     }))
//
//     t.willFireNTimes(div, 'mousedown', 1,  'right click is ok #1')
//
//     // Mac doesn't fire mouseup for right click
//     if (!t.env.isMac) t.willFireNTimes(div, 'mouseup', 1,  'right click is ok #2')
//
//     t.willFireNTimes(div, 'contextmenu', 1,  'right click is ok #3')
//
//     div.addEventListener('mousedown', event => {
//         t.is(event.button, 2, '`buttons` set to 2 for `mousedown` of right click')
//         t.is(event.buttons, 2, '`buttons` set to 2 for `mousedown` of right click')
//     })
//
//     div.addEventListener('contextmenu', event => {
//         event.preventDefault()
//
//         t.is(event.button, 2, '`button` set to 0 for `contextmenu` of right click')
//         t.is(event.buttons, 2, '`buttons` set to 2 for `contextmenu` of right click')
//     })
//
//     await t.rightClick(div)
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Should use the current cursor position for action, if its provided as `[]` or not provided', async t => {
//     document.body.innerHTML =
//         '<div style="position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;" id="marker"></div>'
//
//     await t.moveMouseTo('#marker')
//
//     t.firesOk('#marker', 'click', 3)
//
//     await t.click()
//     await t.click([])
//     // options form, empty target
//     await t.click({})
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('mousedown + mouseup on the same element should fire same event as regular click', async t => {
//     const div   = document.body.appendChild(createElement('div', {
//         style   : 'width : 40px; background: red;',
//         text    : 'testing click'
//     }))
//
//     t.firesOnce(div, [ 'mousedown', 'mouseup', 'click' ])
//
//     await t.mouseDown(div)
//     await t.moveMouseBy(2, 2)
//     await t.mouseUp(div)
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Clicking the element should interact with the top-most element', async t => {
//     // now clicking in the center of the outer (bigger) div
//     // but the click should happen on the top-most element at that position in the DOM
//     let div2 = createElement('div', {
//         parent  : document.body,
//
//         style   : 'width : 100px; height : 100px; background: blue',
//
//         children    : [ {
//             tag     : 'div',
//             style   : 'width : 50px; height : 50px; background: yellow; position : relative; top : 25px; left : 25px',
//             html    : '&nbsp'
//         } ]
//     })
//
//     const innerDiv    = div2.querySelector('div')
//
//     t.willFireNTimes(innerDiv, 'mousedown', 1,  'top click is ok #1')
//     t.willFireNTimes(innerDiv, 'mouseup', 1,  'top click is ok #2')
//     t.willFireNTimes(innerDiv, 'click', 1,  'top click is ok #3')
//
//     await t.click(div2)
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Double click', async t => {
//     const div   = document.body.appendChild(createElement('div', {
//         style   : 'width : 40px; background: green;',
//         text    : 'testing double click'
//     }))
//
//     t.willFireNTimes(div, 'mousedown', 2,  'double click is ok #1')
//     t.willFireNTimes(div, 'mouseup', 2,  'double click is ok #2')
//     t.willFireNTimes(div, 'click', 2,  'double click is ok #3')
//     t.willFireNTimes(div, 'dblclick', 1,  'double click is ok #4')
//
//     await t.doubleClick(div)
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Verify check box click works', async t => {
//     document.body.innerHTML = '<input type="checkbox" />'
//
//     await t.click('input')
//
//     t.selectorExists('input:checked', 'Checkbox should be checked after clicking it')
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Should be possible to click an offset point outside the element', async t => {
//     const div   = document.body.appendChild(createElement('div', {
//         style   : 'width : 40px; background: yellow;',
//         text    : 'testing click'
//     }))
//
//     t.willFireNTimes(document.body, 'click', 1,  'Click event is fired')
//
//     await t.click(div, [ '100% + 1', '50%' ])
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Intentionally clicking outside an element should NOT issue a warning', async t => {
//     document.body.innerHTML =
//         '<div id="clickel" style="margin: 10px; width: 100px; height: 100px; background: gray"></div>'
//
//     t.firesOk(document.body, 'click', 2)
//     t.wontFire('#clickel', 'click')
//
//     await t.click('#clickel', [ '100% + 1', '100%' ])
//     await t.click('#clickel', [ -5, '100%' ])
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Failed clicks (due to element not actionable) should create failing assertion #1', async t => {
//     t.todo('internal', async t => {
//         const div = document.body.appendChild(createElement('div', {
//             style   : 'width : 40px; display: none',
//             text    : 'testing click'
//         }))
//
//         await t.click({ target : div, timeout : 30 })
//
//     }).postFinishHook.on(todoTest => {
//         verifyAllFailed(todoTest, t)
//
//         const assertions        = Array.from(todoTest.eachResultOfClassDeep(Assertion))
//
//         t.is(assertions.length, 1)
//
//         t.is(assertions[ 0 ].name, 'waitForElementActionable')
//     })
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Failed clicks (due to element not actionable) should create failing assertion #2', async t => {
//     t.todo('internal', async t => {
//         document.body.innerHTML =
//             '<div style="border: 1px solid #ddd; width: 100px; height: 100px; overflow: hidden">' +
//                 '<div style="width: 500px; height: 100px" id="inner">FOO</div>' +
//             '</div>'
//
//         t.wontFire('#inner', 'click')
//
//         await t.click({ target : '#inner', offset : [ 101, 90 ], timeout : 30 })
//
//     }).postFinishHook.on(todoTest => {
//         t.false(todoTest.passedRaw, 'Test is failed (not taking into account `isTodo` flag')
//
//         const assertions        = Array.from(todoTest.eachResultOfClassDeep(Assertion))
//
//         t.is(assertions.length, 2)
//
//         t.is(assertions[ 0 ].name, 'waitForElementActionable')
//     })
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Click should prevent the test from stopping, even w/o `await`', async t => {
//     let clicked   = false
//
//     t.it('internal', async t => {
//
//         const div = document.body.appendChild(createElement('div', {
//             style   : 'width : 40px;',
//             text    : 'testing click'
//         }))
//
//         div.addEventListener('click', () => clicked = true)
//
//         // intentionally do not `await` here
//         t.click(div)
//
//     }).postFinishHook.on(test => {
//         t.true(clicked, 'Click completed before test finalization')
//     })
// })
//
//
