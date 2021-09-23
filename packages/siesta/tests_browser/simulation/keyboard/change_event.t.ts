import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire change event after field changed + ENTER key', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" value=""/>'

    const field = document.getElementById('inp1')

    t.firesOnce(field, 'change')

    await t.type(field, 'foo[ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should NOT fire change event after key input and field has not changed + ENTER key', async t => {
    document.body.innerHTML = '<input id="inp2" type="text" value="quix"/>'

    const field = document.getElementById('inp2') as HTMLInputElement

    t.wontFire(field, 'change')

    await t.type(field, 'f[BACKSPACE][ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire change event after field changed and mouse clicks outside field', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" value=""/>'

    const field = document.getElementById('inp1') as HTMLInputElement

    t.firesOnce(field, 'change')

    await t.type(field, 'foo')

    await t.click(field, [ '100% + 10', '50%' ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire change event after field changed by TAB', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" value=""/>'

    const field = document.getElementById('inp1') as HTMLInputElement

    t.firesOnce(field, 'change')

    await t.type(field, 'foo[TAB]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// !bowser.gecko &&
it('Should fire change event after field changed and field is blurred programmatically', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" value=""/>'

    const field = document.getElementById('inp1') as HTMLInputElement

    t.firesOnce(field, 'change')

    await t.type(field, 'foo')

    field.blur()
})
