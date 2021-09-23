import { beforeEach, describe, it } from "../../../browser.js"
import { createPositionedIframe } from "../../@helpers.js"

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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire change after tabbing out of field after value changed using BACKSPACE', async t => {
    document.body.innerHTML = '<input value="foo"/>'

    const input     = t.$('input') as HTMLInputElement

    t.firesOnce('input', 'change')

    await t.click('input')

    await t.type('input', '[BACKSPACE][TAB]')

    t.is(input.value, 'fo')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire change after tabbing out of field after value changed using DELETE', async t => {
    document.body.innerHTML = '<input value="foo"/>'

    const input     = t.$('input') as HTMLInputElement

    t.firesOnce('input', 'change')

    t.setCaretPosition(input, 0)

    await t.type('input', '[DELETE][TAB]')

    t.is(input.value, 'oo')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Should fire `change` event on focus move, for nested iframe', async t => {
    let DOC : Document

    t.beforeEach(async t => {
        const iframe  = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 300, height : 200 })

        DOC           = iframe.contentWindow.document
    })

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    t.it('Should fire `change` event on regular blur', async t => {
        DOC.body.innerHTML  = '<input id="input" value=""/>'

        const input         = DOC.getElementById('input') as HTMLInputElement

        t.firesOnce(input, 'change')

        await t.type(input, 'some[TAB]')

        t.is(input.value, 'some')
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    t.it('Should fire `change` event after tabbing out of field after value changed using BACKSPACE', async t => {
        DOC.body.innerHTML  = '<input id="input" value="foo"/>'

        const input         = DOC.getElementById('input') as HTMLInputElement

        t.firesOnce(input, 'change')

        await t.click(input)

        await t.type(input, '[BACKSPACE][TAB]')

        t.is(input.value, 'fo')
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    t.it('Should fire `change` event after tabbing out of field after value changed using DELETE', async t => {
        DOC.body.innerHTML  = '<input id="input" value="foo"/>'

        const input         = DOC.getElementById('input') as HTMLInputElement

        t.firesOnce(input, 'change')

        t.setCaretPosition(input, 0)

        await t.type(input, '[DELETE][TAB]')

        t.is(input.value, 'oo')
    })
})
