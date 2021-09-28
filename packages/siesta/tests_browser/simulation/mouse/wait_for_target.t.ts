import { beforeEach, it, TestBrowser } from "../../../browser.js"
import { createPositionedElement } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(async (t : TestBrowser) => {
    document.body.innerHTML = ''

    await t.moveMouseTo(0, 0)
})


const createDelayedDiv = (delay : number = 50) : HTMLElement => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    div.style.backgroundColor = 'green'
    div.id          = 'delayed'

    setTimeout(() => document.body.appendChild(div), delay)

    return div
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`mouseDown` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'mousedown')

    await t.mouseDown('#delayed')
    await t.mouseUp()
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`mouseUp` should await for target to become actionable', async t => {
    await t.mouseDown()

    const div = createDelayedDiv()

    t.firesOnce(div, 'mouseup')

    await t.mouseUp('#delayed')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`moveMouseTo` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.waitForEvent(div, 'mousemove')

    await t.moveMouseTo('#delayed')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`click` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'click')

    await t.click('#delayed')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`rightClick` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'contextmenu')

    div.addEventListener('contextmenu', e => e.preventDefault())

    await t.rightClick('#delayed')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`rightClick` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'contextmenu')

    div.addEventListener('contextmenu', e => e.preventDefault())

    await t.rightClick('#delayed')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`doubleClick` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'dblclick')

    await t.doubleClick('#delayed')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`dragTo` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'mousedown')

    await t.dragTo('#delayed', [ 300, 300 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`dragBy` should await for target to become actionable', async t => {
    const div = createDelayedDiv()

    t.firesOnce(div, 'mousedown')

    await t.dragBy('#delayed', [ 100, 100 ])
})


// StartTest(async t => {
//     t.describe('Basic tests', async t => {
//
//         t.it('dragBy', async t => {
//
//             let btn = new Ext.Button({ id : 'dragBy', text : 'dragBy' })
//
//             setTimeout(function () {
//                 btn.render(Ext.getBody())
//
//                 t.firesOnce(btn.el, 'mousedown')
//             }, 500)
//
//             t.chain(
//                 { drag : '#dragBy', by : [2, 2] }
//             )
//         })
//
//
//         t.it('dragTo - wait for source', async t => {
//             let btn = new Ext.Button({ id : 'dragTo', text : 'dragTo' })
//
//             setTimeout(function () {
//                 btn.render(Ext.getBody())
//
//                 t.firesOnce(btn.el, 'mousedown')
//             }, 500)
//
//             t.chain(
//                 { drag : '#dragTo', to : [2, 2] }
//             )
//         })
//
//
//         t.it('dragTo - wait for source && target', async t => {
//             let btnSource   = new Ext.Button({ id : 'dragSource', text : 'dragSource' })
//             let btnTarget   = new Ext.Button({ id : 'dragTarget', text : 'dragTarget' })
//
//             setTimeout(function () {
//                 btnSource.render(Ext.getBody())
//
//                 t.firesOnce(btnSource.el, 'mousedown')
//
//                 setTimeout(function () {
//                     btnTarget.render(Ext.getBody())
//
//                     t.firesOnce(btnTarget.el, 'mouseup')
//                 }, 250)
//             }, 250)
//
//             t.chain(
//                 { drag : '>>#dragSource', to : '>>#dragTarget' }
//             )
//         })
//
//
//         t.it('Should wait until target el becomes top', async t => {
//             let el1 = document.createElement('div')
//
//             el1.id             = 'one'
//             el1.style.position = 'absolute'
//             el1.style.left     = '0'
//             el1.style.top      = '100px'
//             el1.style.zIndex   = 5
//             el1.innerHTML      = 'TEXT ONE'
//
//             document.body.appendChild(el1)
//
//             let el2 = document.createElement('div')
//
//             el2.id             = 'two'
//             el2.style.position = 'absolute'
//             el2.style.left     = '0'
//             el2.style.top      = '100px'
//             el2.style.zIndex   = 1
//             el2.innerHTML      = 'TEXT TWO'
//
//             let el2Clicked = false
//
//             Ext.get(el2).on('click', function () {
//                 el2Clicked = true
//             })
//
//             let async = t.beginAsync()
//
//             setTimeout(function () {
//                 document.body.appendChild(el2)
//
//                 setTimeout(function () {
//                     t.notOk(el2Clicked, "Click not happened yet, even that `el2` is already in DOM")
//
//                     el2.style.zIndex = 10
//
//                     t.endAsync(async)
//                 }, 500)
//             }, 100)
//
//             t.chain(
//                 { click : '#two' },
//                 function () {
//                     t.ok(el2Clicked, "Click registered")
//                 }
//             )
//         })
//
//         t.it('Stress test: should handle moving targets', async t => {
//             let button = new Ext.Button({
//                 text     : "Click me",
//                 id       : 'btn10',
//                 floating : true,
//                 renderTo : document.body
//             })
//
//             let positions = [
//                 [0, 0],
//                 [500, 0],
//                 [500, 500],
//                 [0, 500],
//                 [0, 0]
//             ]
//
//             t.willFireNTimes(button, 'click', 1)
//
//             t.chain(
//                 { moveCursorTo : [500, 500] },
//
//                 // Move the cursor away so it takes a bit of time to reach the button initially
//                 function (next) {
//                     button.setPosition(positions[0][0], positions[0][1])
//                     t.click('#btn10', function () {})
//
//                     next()
//                 },
//
//                 { waitFor : 150 },
//
//                 function (next) {
//                     button.setPosition(positions[1][0], positions[1][1])
//
//                     next()
//                 },
//                 { waitFor : 150 },
//
//                 function (next) {
//                     button.setPosition(positions[2][0], positions[2][1])
//
//                     next()
//                 },
//
//                 { waitFor : 150 },
//
//                 function (next) {
//                     button.setPosition(positions[3][0], positions[3][1])
//
//                     next()
//                 },
//                 { waitFor : 150 },
//
//                 function (next) {
//                     button.setPosition(positions[4][0], positions[4][1])
//
//                     t.waitForEvent(button, 'click', next)
//                 }
//             )
//         })
//     })
//
//     t.describe('should handle temporarily unreachable targets', async t => {
//         let panel, button
//
//         function scheduleMask (next) {
//
//             setTimeout(function () {
//                 panel.mask('oops')
//
//                 setTimeout(function () {
//                     panel.unmask()
//                 }, 2000)
//             }, 50)
//
//             next()
//         }
//
//         t.beforeEach(function () {
//             panel = panel && panel.destroy()
//
//             button = new Ext.Button({
//                 text      : "Click me",
//                 id        : 'btn',
//                 draggable : true
//             })
//
//             panel = new Ext.Panel({
//                 style    : 'margin-top:100px',
//                 buttons  : [button],
//                 renderTo : document.body,
//                 height   : 100,
//                 width    : 100
//             })
//         })
//
//         t.it('should handle clicking temp unreachable targets', async t => {
//             t.willFireNTimes(button, 'click', 1)
//
//             t.chain(
//                 { moveCursorTo : [0, 0] },
//                 scheduleMask,
//                 { click : '#btn' }
//             )
//         })
//
//         t.it('should handle draggin temp unreachable targets', async t => {
//
//             t.firesAtLeastNTimes(button, 'move', 1)
//
//             t.chain(
//                 { moveCursorTo : [0, 0] },
//                 scheduleMask,
//                 { drag : '#btn', to : [100, 40] }
//             )
//         })
//
//         t.it('should handle draggin temp unreachable targets', async t => {
//
//             t.firesAtLeastNTimes(button, 'move', 1)
//
//             t.chain(
//                 { moveCursorTo : [0, 0] },
//                 scheduleMask,
//                 { drag : '#btn', by : [-10, 0] }
//             )
//         })
//     })
//
// })
