import { beforeEach, it } from "../../../browser.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"
import { createElement } from "../../@helpers.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML =
        '<div style="position: relative; width: 10px; height: 1500px; border: 1px solid;">scroller</div>' +
        '<div id="clicker" style="position: absolute; left: 100px; top: 600px; height: 200px; background: red;">clicker</div>'

    document.scrollingElement.scrollTop = 500
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Left click', async t => {
    // const clickDiv = document.body.appendChild(createElement('div', {
    //     style   : 'width : 40px;',
    //     text    : 'testing click'
    // }))
    //
    // t.willFireNTimes(clickDiv, 'mousedown', 1,  'left click is ok #1')
    // t.willFireNTimes(clickDiv, 'mouseup', 1,  'left click is ok #2')
    // t.willFireNTimes(clickDiv, 'click', 1,  'left click is ok #3')
    //
    // clickDiv.addEventListener('mousedown', event => {
    //     t.is(event.button, 0, 'button to 0 for left click')
    //
    //     // Siesta5 comment: IE and Safari does not support "event.buttons" property
    //     // but according to MDN Safari supports it since 11.1
    //     t.is(event.buttons, 1, 'buttons to 1 for left click')
    // })
    //
    // clickDiv.addEventListener('mouseup', event => {
    //     t.is(event.button, 0, 'button to 0 for left click')
    //     t.is(event.buttons, 0, 'buttons to 0 for left click')
    // })
    //
    // clickDiv.addEventListener('click', event => {
    //     t.is(event.button, 0, 'button to 0 for left click')
    //     t.is(event.buttons, 0, 'buttons to 0 for left click')
    // })
    //
    // await t.click(clickDiv)
})

