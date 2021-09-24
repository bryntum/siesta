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
it('Should be able to move cursor to the element with offset, inside the element', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', 'click', 4)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, 0 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 50 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, '100% - 1' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 99 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100% - 1', '100% - 1' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 99, 99 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100% - 1', 0 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 99, 50 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to move cursor to the element with offset, outside the element', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', 'click', 0)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, -1 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 49 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, '100%' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 100 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100%', '100%' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 100, 100 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100%', 0 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 100, 50 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should set `buttons` property in `mousemove` events during left-button drag', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    await t.moveMouseTo('#box', [ -1, '50%' ])

    document.body.addEventListener('contextmenu', (e : MouseEvent) => e.preventDefault())

    await t.mouseDown()

    t.firesOk('div', { mousemove : '>=1', mouseover : 1, mouseout : 1, mouseenter : 1, mouseleave : 1 });

    [ 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ].forEach(eventName => {
        t.$('div').addEventListener(eventName, (e : MouseEvent) => {
            t.silent.is(e.button, 0, `${ e.type }: 'button' property set correctly`)
            t.silent.is(e.buttons, 1, `${ e.type }: 'buttons' property set correctly`)
        }, { once : true })
    })

    await t.moveMouseTo('div')

    await t.moveMouseTo('div', [ '100% + 1', '50%' ])

    await t.mouseUp()
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should set `buttons` property in mouse move events during right-button drag', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    await t.moveMouseTo('#box', [ -1, '50%' ])

    document.body.addEventListener('contextmenu', (e : MouseEvent) => e.preventDefault())

    await t.mouseDown({ button : 'right' })

    t.firesOk('div', { mousemove : '>=1', mouseover : 1, mouseout : 1, mouseenter : 1, mouseleave : 1 });

    [ 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ].forEach(eventName => {
        t.$('div').addEventListener(eventName, (e : MouseEvent) => {
            t.silent.is(e.button, 0, `${ e.type }: 'button' property set correctly`)
            t.silent.is(e.buttons, 2, `${ e.type }: 'buttons' property set correctly`)
        }, { once : true })
    })

    await t.moveMouseTo('div')

    await t.moveMouseTo('div', [ '100% + 1', '50%' ])

    await t.mouseUp({ button : 'right' })
})


