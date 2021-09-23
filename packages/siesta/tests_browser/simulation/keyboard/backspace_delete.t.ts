import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should mimic char removal on BACKSPACE, when cursor is at the end of the value', async t => {
    document.body.innerHTML     = '<input id="foo" type="text" value="abcdef"/>'

    const field                 = t.$('#foo') as HTMLInputElement

    t.firesOk(field, 'input', 2)

    t.setCaretPosition(field, 10)

    await t.type(field, '[BACKSPACE][BACKSPACE]')

    t.is(field.value, 'abcd')

    t.is(t.getCaretPosition(field), 4)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should mimic char removal on BACKSPACE, when cursor is in the middle of the value', async t => {
    document.body.innerHTML     = '<input id="foo" type="text" value="abcdef"/>'

    const field                 = t.$('#foo') as HTMLInputElement

    t.firesOk(field, 'input', 2)

    t.setCaretPosition(field, 2)

    await t.type(field, '[BACKSPACE][BACKSPACE]')

    t.is(field.value, 'cdef')

    t.is(t.getCaretPosition(field), 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not mimic char removal on BACKSPACE if caret position is 0', async t => {
    document.body.innerHTML     = '<input id="foo" type="text" value="abcdef"/>'

    const field                 = t.$('#foo') as HTMLInputElement

    t.firesOk(field, { input : 0, keydown : 1, keyup : 1, keypress : 0 })

    t.setCaretPosition(field, 0)

    await t.type(field, '[BACKSPACE]')

    t.is(field.value, 'abcdef')

    t.is(t.getCaretPosition(field), 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should mimic delete char in front of caret on DELETE', async t => {
    document.body.innerHTML     = '<input id="foo" type="text" value="abcdef"/>'

    const field                 = t.$('#foo') as HTMLInputElement

    t.firesOk(field, { input : 2, keydown : 2, keyup : 2, keypress : 0 })

    t.setCaretPosition(field, 0)

    await t.type(field, '[DELETE][DELETE]')

    t.is(field.value, 'cdef')

    t.is(t.getCaretPosition(field), 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should NOT mimic delete char in front of caret on DELETE if caret is at the end', async t => {
    document.body.innerHTML     = '<input id="foo" type="text" value="abcdef"/>'

    const field                 = t.$('#foo') as HTMLInputElement

    t.firesOk(field, { input : 0, keydown : 1, keyup : 1, keypress : 0 })

    t.setCaretPosition(field, 6)

    await t.type(field, '[DELETE]')

    t.is(field.value, 'abcdef')

    t.is(t.getCaretPosition(field), 6)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`keyPress` method should support special chars like [DELETE]', async t => {
    document.body.innerHTML     = '<input id="foo" type="text" value="abcdef"/>'

    const field                 = t.$('#foo') as HTMLInputElement

    t.selectText(field)

    await t.keyPress(field, '[DELETE]')

    t.is(field.value, '', "Correctly typed special character")
})
