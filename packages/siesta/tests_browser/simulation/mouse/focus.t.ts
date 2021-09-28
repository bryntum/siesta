import { beforeEach, it } from "../../../browser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should trigger focus event on mousedown if el has tabIndex', async t => {
    document.body.innerHTML = '<div tabIndex="-1" id="div" style="width: 20px; height: 20px; background: #fee"></div>'

    const waiting   = t.waitForEvent('#div', 'focus')

    await t.mouseDown('#div')

    await waiting

    await t.mouseUp()
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should NOT trigger focus event on mousedown on div without tabIndex', async t => {
    document.body.innerHTML = '<div id="div" style="width: 20px; height: 20px; background: #fee"></div>'

    t.wontFire('#div', 'focus')

    await t.mouseDown('#div')
    await t.mouseUp()
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should trigger focus event on drag', async t => {
    document.body.innerHTML = '<div id="div" tabIndex="-1" style="width: 20px; height: 20px; background: #fee"></div>'

    t.firesOnce('#div', 'focus')

    await t.dragBy('#div', [ 10, 10 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not trigger focus event on mousedown if el has disabled attribute', async t => {
    document.body.innerHTML = '<input type="text" id="div" disabled style="width: 20px; height: 20px; background: #fee"/>'

    t.wontFire('#div', 'focus')

    await t.mouseDown('#div')
    await t.mouseUp()
})
