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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should trigger focus/blur when clicking inside/outside of the text input', async t => {
    // in FF default width of input is > 200px need provide explicit value
    document.body.innerHTML = '<input style="width: 150px" id="inp" type="text" />'

    t.willFireNTimes("#inp", 'focus', 1)
    t.willFireNTimes("#inp", 'blur', 1)

    await t.click('#inp')
    await t.click('#inp', [ '100% + 10', '100% + 10' ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not trigger extra blur event when clicking on another text input', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" /><input id="inp2" type="text" />'

    t.willFireNTimes("#inp1", 'focus', 1)
    t.willFireNTimes("#inp1", 'blur', 1)
    t.willFireNTimes("#inp2", 'focus', 1)

    await t.click('#inp1')
    await t.click('#inp2')
})
