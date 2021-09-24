import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Moving mouse to coordinate should work', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; left: 657px; top: 123px; width: 1px; height: 1px; background: red;" id="marker"></div>'

    t.firesOnce('#marker', 'mouseenter')

    await t.moveMouseTo([ 657, 123 ])

    t.equal(t.simulator.currentPosition, [ 657, 123 ], 'Moved cursor to correct point')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Moving mouse to element should work', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;" id="marker"></div>'

    t.firesOnce('#marker', 'mouseenter')

    await t.moveMouseTo('#marker', [ 0, 0 ])

    t.isDeeply(t.simulator.currentPosition, [ 50, 50 ], 'moveMouseTo Input: Element - Cursor moved to correct place')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should set `buttons` property in `mousemove` events during left-button drag', async t => {
    document.body.innerHTML = '<div style="width: 50px; height: 50px; background: #ccc;"></div>'

    await t.moveMouseTo('div')

    await t.mouseDown()

    let listener

    t.$('div').addEventListener('mousemove', listener = (e : MouseEvent) => {
        t.is(e.button, 0, '`button` property set correctly')
        t.is(e.buttons, 1, '`buttons` property set correctly')
    })

    await t.moveMouseTo(10, 10)

    await t.mouseUp()

    t.$('div').removeEventListener('mousemove', listener)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should set `buttons` property in `mousemove` events during right-button drag', async t => {
    document.body.innerHTML = '<div style="width: 50px; height: 50px; background: #ccc;"></div>'

    await t.moveMouseTo('div')

    t.$('div').addEventListener('contextmenu', (e : MouseEvent) => e.preventDefault())

    await t.mouseDown({ button : 'right' })

    let listener

    t.$('div').addEventListener('mousemove', listener = (e : MouseEvent) => {
        t.is(e.button, 0, '`button` property set correctly')
        t.is(e.buttons, 2, '`buttons` property set correctly')
    })

    await t.moveMouseTo(10, 10)

    await t.mouseUp({ button : 'right' })

    t.$('div').removeEventListener('mousemove', listener)
})
