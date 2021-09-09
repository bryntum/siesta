import { it } from "../../../browser.js"
import { delay } from "../../../src/util/TimeHelpers.js"
import { createElement } from "../../@helpers.js"


it('Verify check box click works', async t => {
    document.body.innerHTML = '<input type="checkbox" />'

    await t.click('input')

    t.selectorExists('input:checked', 'Checkbox should be checked after clicking it')
})


//-------------------------------------------------------
it('Click should prevent the test from stopping, even w/o `await`', async t => {
    const div = document.body.appendChild(createElement(document, 'div', {
        style   : 'width : 40px;',
        text    : 'testing click'
    }))

    let clicked   = false

    div.addEventListener('click', () => clicked = true)

    t.it('internal', async t => {

        t.click(div)

    }).postFinishHook.on(test => {
        t.true(clicked, 'Click completed before test finalization')
    })
})



it('plain simple clicks', async t => {
    const clickDiv = document.body.appendChild(createElement(document, 'div', {
        style   : 'width : 40px;',
        text    : 'testing click'
    }))

    t.willFireNTimes(clickDiv, 'mousedown', 1,  'left click is ok #1')
    t.willFireNTimes(clickDiv, 'mouseup', 1,  'left click is ok #2')
    t.willFireNTimes(clickDiv, 'click', 1,  'left click is ok #3')

    clickDiv.addEventListener('mousedown', event => {
        t.is(event.button, 0, 'button to 0 for left click')

        // Siesta5 comment: IE and Safari does not support "event.buttons" property
        // but according to MDN Safari supports it since 11.1
        t.is(event.buttons, 1, 'buttons to 1 for left click')
    })

    clickDiv.addEventListener('click', event => {
        t.is(event.button, 0, 'button to 0 for left click')
        t.is(event.buttons, 0, 'buttons to 1 for left click')
    })

    await t.click(clickDiv)
})


it('mousedown + mouseup abstraction should fire same event as regular click', async t => {
    const div   = document.body.appendChild(createElement(document, 'div', {
        style   : 'width : 40px; background:red;',
        text    : 'testing click'
    }))

    t.willFireNTimes(div, 'mousedown', 1)
    t.willFireNTimes(div, 'mouseup', 1)
    t.willFireNTimes(div, 'click', 1)

    await t.mouseDown(div)
    await t.moveMouseBy([ 2, 2 ])
    await t.mouseUp(div)
})


it('mousedown + mouseup abstraction should NOT fire click event if mouseup is not in same parent el as the mousedown source', async t => {
    const div   = document.body.appendChild(createElement(document, 'div', {
        style   : 'width : 40px; background:green;',
        text    : 'testing click'
    }))

    t.willFireNTimes(div, 'mousedown', 1)
    t.willFireNTimes(document.body, 'mouseup', 1)
    t.wontFire(div, 'mouseup')
    t.wontFire(div, 'click')
    t.wontFire(document.body, 'click')

    await t.mouseDown(div)

    div.style.display = 'none'

    await t.mouseUp()
})


// it('right clicks', async t => {
//
//     let rightClickDiv = Ext.getBody().createChild({
//         tag     : 'div',
//         style   : 'width : 40px;',
//         html    : 'testing right click'
//     })
//
//     t.willFireNTimes(rightClickDiv, 'mousedown', 1,  'right click is ok #1')
//
//     // Mac doesn't fire mouseup for right click
//     if (!Ext.isMac) {
//         t.willFireNTimes(rightClickDiv, 'mouseup', 1,  'right click is ok #2')
//     }
//
//     t.willFireNTimes(rightClickDiv, 'contextmenu', 1,  'right click is ok #3')
//
//     rightClickDiv.on('contextmenu', function (event) {
//         event.preventDefault()
//
//         t.is(event.button, 2, 'button to 2 for contextmenu')
//         // chrome on windows with native fails to set the "buttons" for right click it seems
//         if (!Ext.isIE && !Ext.isSafari && !(t.simulator.type == 'native' && t.bowser.windows)) t.is(event.buttons, 2, 'buttons to 2 for contextmenu')
//     })
//
//     t.chain(
//         {
//             rightClick      : rightClickDiv
//         }
//     )
// })
//
//
// it('double clicks', async t => {
//
//     let doubleClickDiv = Ext.getBody().createChild({
//         tag     : 'div',
//         style   : 'width : 40px;',
//         html    : 'testing double click'
//     })
//
//     t.willFireNTimes(doubleClickDiv, 'mousedown', 2,  'double click is ok #1')
//     t.willFireNTimes(doubleClickDiv, 'mouseup', 2,  'double click is ok #2')
//     t.willFireNTimes(doubleClickDiv, 'click', 2,  'double click is ok #3')
//     t.willFireNTimes(doubleClickDiv, 'dblclick', 1,  'double click is ok #4')
//
//     // now clicking in the center of the outer (bigger) div
//     // but the click should happen on the top-most element at that position in the DOM
//     let div2 = Ext.getBody().createChild({
//         tag     : 'div',
//         style   : 'width : 100px; height : 100px; background: blue',
//
//         children    : {
//             tag     : 'div',
//             style   : 'width : 50px; height : 50px; background: yellow; position : relative; top : 25px; left : 25px',
//             html    : '&nbsp'
//         }
//     })
//
//     let innerDiv    = div2.child('div')
//
//     t.willFireNTimes(innerDiv, 'mousedown', 1,  'top click is ok #1')
//     t.willFireNTimes(innerDiv, 'mouseup', 1,  'top click is ok #2')
//     t.willFireNTimes(innerDiv, 'click', 1,  'top click is ok #3')
//
//     t.chain(
//         {
//             doubleclick      : doubleClickDiv
//         },
//         {
//             click      : div2
//         }
//     )
// })
//
// !Ext.isIE10m && it("should support clicking SVG element with float values", async t => {
//     document.body.innerHTML =
//         '<svg width="800px" height="800px"><rect id="myrect" x="50.5" y="50.5" width="100.2" height="100.1"></rect></svg>'
//     //
//     // The second mouseover is fired as part of the waitForTargetAndSyncMousePosition method
//     // called from the moveCursor to prepare for the actual action
//
//     let firstRect = document.getElementById('myrect')
//
//     t.willFireNTimes(firstRect, 'mouseover', 1)
//     t.willFireNTimes(firstRect, 'mouseout', 1)
//
//     t.willFireNTimes(firstRect, 'mouseenter', 1)
//     t.willFireNTimes(firstRect, 'mouseleave', 1)
//
//     t.willFireNTimes(firstRect, 'mousedown', 1)
//     t.willFireNTimes(firstRect, 'mouseup', 1)
//     t.willFireNTimes(firstRect, 'click', 1)
//
//     t.chain(
//         { click : '#myrect' },
//
//         // Should trigger inner element 'mouseout' event + 'mouseleave' event (fired manually by Ext if browser doesn't support it)
//         { action      : 'moveCursor', to : [ 2, 150 ] }
//     )
// })
//
// !Ext.isIE10m && it("should support clicking SVG element with translate values", async t => {
//     document.body.innerHTML =
//         '<svg width="800px" height="800px"><g transform="translate(0.5,0.5)"><rect id="myrect" x="50" y="50" width="100" height="100"></rect></g></svg>'
//
//     let firstRect = document.querySelector('svg > g rect')
//
//     t.willFireNTimes(firstRect, 'mouseover', 1)
//     t.willFireNTimes(firstRect, 'mouseout', 1)
//
//     t.willFireNTimes(firstRect, 'mouseenter', 1)
//     t.willFireNTimes(firstRect, 'mouseleave', 1)
//
//     t.willFireNTimes(firstRect, 'mousedown', 1)
//     t.willFireNTimes(firstRect, 'mouseup', 1)
//     t.willFireNTimes(firstRect, 'click', 1)
//
//     t.chain(
//         { click : '#myrect'},
//
//         // Should trigger inner element 'mouseout' event + 'mouseleave' event (fired manually by Ext if browser doesn't support it)
//         { action      : 'moveCursor', to : [ 2, 150 ] }
//     )
// })
//
// // Interacting with scaled SVG not supported in IE / Edge
// !bowser.msie && !bowser.msedge && !bowser.gecko && it("should support clicking SVG element with scaled values", async t => {
//     document.body.innerHTML =
//         '<svg width="800px" height="800px" style="position:absolute;left:100px;top:100px"><g transform="scale(0.5)"><rect id="myrect" x="50" y="50" width="100" height="100"></rect></g></svg>'
//
//     let firstRect = document.querySelector('svg > g rect')
//
//     t.willFireNTimes(firstRect, 'mouseover', 1)
//     t.willFireNTimes(firstRect, 'mouseout', 1)
//
//     t.willFireNTimes(firstRect, 'mouseenter', 1)
//     t.willFireNTimes(firstRect, 'mouseleave', 1)
//
//     t.willFireNTimes(firstRect, 'mousedown', 1)
//     t.willFireNTimes(firstRect, 'mouseup', 1)
//     t.willFireNTimes(firstRect, 'click', 1)
//
//     t.chain(
//         { click : '#myrect'},
//
//         // Should trigger inner element 'mouseout' event + 'mouseleave' event (fired manually by Ext if browser doesn't support it)
//         { action      : 'moveCursor', to : [ 2, 150 ] }
//     )
// })
//
// !bowser.msie && !bowser.msedge && it("should support clicking a polyline", async t => {
//     document.body.innerHTML =
//         '<svg style="width: 1px;height: 1px;overflow: visible;position: absolute;pointer-events: none;">' +
//         '<marker id="arrowStart" markerWidth="12" markerHeight="12" refX="1" refY="3" viewBox="0 0 9 6" orient="auto" markerUnits="userSpaceOnUse">' +
//         '<path d="M0,3 L9,6 L9,0 z"></path>' +
//         '</marker>' +
//         '<marker id="arrowEnd" markerWidth="12" markerHeight="12" refX="8" refY="3" viewBox="0 0 9 6" orient="auto" markerUnits="userSpaceOnUse">' +
//         '<path d="M0,0 L0,6 L9,3 z"></path>' +
//         '</marker>' +
//         '<polyline style="pointer-events:all;fill: transparent;marker-end: url(#arrowEnd);stroke: #999;stroke-width: 1;" class="b-sch-dependency" depId="1" points="300,22.5 312,22.5 312,22.5 312,37 312,37 188,37 188,37 188,68.5 188,68.5 200,68.5"></polyline>' +
//         '</svg>'
//
//     t.firesOk({
//         observable      : '.b-sch-dependency',
//         events          : {
//             click   : 1
//         }
//     })
//
//     t.chain(
//         { click : '.b-sch-dependency', offset : [0, '50%'] }
//     )
// })
//
// !Ext.isIE10m && it('moving mouse to svg element should work', async t => {
//     document.body.innerHTML = [
//         '<svg>',
//         '<marker xmlns="http://www.w3.org/2000/svg" id="arrowEnd" viewBox="0 0 9 6" refX="8" refY="3" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M 0 0 L 0 6 L 9 3 Z" /></marker>',
//         '<polyline style="stroke:#999;marker-end:url(#arrowEnd)" class="target-line" points="100,100 120,120"></polyline>',
//         '</svg>'
//     ].join('')
//
//     let line = document.querySelector('.target-line')
//
//     t.willFireNTimes(line, 'mouseover', 1)
//     t.willFireNTimes(line, 'mouseenter', 1)
//     t.willFireNTimes(line, 'click', 1)
//
//     t.chain(
//         { moveMouseTo : '.target-line' },
//
//         function (next) {
//             t.isApprox(t.currentPosition[0], 110, 'X')
//             t.isApprox(t.currentPosition[1], 110, 'Y')
//
//             next()
//         },
//         { click : '.target-line' }
//     )
// })
