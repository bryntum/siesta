import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should replace partially selected text with typed text', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="foo foo bar"/>'

    const field               = t.$('#foo') as HTMLInputElement

    t.selectText(field, 4, 7)

    await t.type(field, 'new')

    t.is(field.value, 'foo new bar', 'Selecting text and typing replaces original value.')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should replace fully selected text with typed text', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="Default"/>'

    const field               = t.$('#foo') as HTMLInputElement

    t.selectText(field)

    await t.type(field, 'Replacement')

    t.is(field.value, 'Replacement', 'Selecting text and typing replaces original value.')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should delete partially selected text on BACKSPACE', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="123456123"/>'

    const field = t.$('#foo') as HTMLInputElement

    t.selectText(field, 6)

    await t.type(field, '[BACKSPACE]')

    t.is(field.value, '123456')
    t.is(t.getCaretPosition(field), 6)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should delete fully selected text on BACKSPACE', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="123456123"/>'

    const field = t.$('#foo') as HTMLInputElement

    t.selectText(field)

    await t.type(field, '[BACKSPACE]')

    t.is(field.value, '')
    t.is(t.getCaretPosition(field), 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should delete partially selected text on DELETE', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="123456123"/>'

    const field = t.$('#foo') as HTMLInputElement

    t.selectText(field, 3, 6)

    await t.type(field, '[DELETE]')

    t.is(field.value, '123123')
    t.is(t.getCaretPosition(field), 3)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should delete fully selected text on DELETE', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="123456123"/>'

    const field = t.$('#foo') as HTMLInputElement

    t.selectText(field)

    await t.type(field, '[DELETE]')

    t.is(field.value, '')
    t.is(t.getCaretPosition(field), 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// !t.bowser.firefox &&
it('Should mimic caret movement even if keypress was prevented', async t => {
    document.body.innerHTML = '<input id="foo" type="text" value="1000"/>'

    const field = t.$('#foo') as HTMLInputElement

    field.addEventListener('keypress', e => e.key.match('Arrow') && e.preventDefault())

    t.selectText(field, 0, 2)

    await t.type(field, '[ARROWLEFT][ARROWRIGHT][BACKSPACE]28')

    t.is(field.value, '28000')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should select all on SHIFT/CMD + LEFT/RIGHT keys', async t => {
    document.body.innerHTML = '<input type="text" id="foo" value="rde"/>'

    const isMac = t.env.isMac

    await t.click('#foo')

    await t.type('#foo', '[LEFT]', { shiftKey : true, [ isMac ? 'metaKey' : 'ctrlKey' ] : true } )

    t.expect(t.getSelectedText('#foo')).toBe('rde')
    t.setCaretPosition('#foo', 1)

    await t.type('#foo', '[RIGHT]', { shiftKey : true, [ isMac ? 'metaKey' : 'ctrlKey' ] : true } )

    t.expect(t.getSelectedText('#foo')).toBe('de')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should select text in the input field on double click', async t => {
    document.body.innerHTML = '<input type="text" id="foo" value="hello"/>'

    await t.doubleClick('#foo')

    t.expect(t.getSelectedText('#foo')).toBe("hello")

    await t.click('#foo')

    t.expect(t.getSelectedText('#foo')).toBe("")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should select text in the input field on CTRL+A click (META+A) on Mac', async t => {
    document.body.innerHTML = '<input type="text" id="foo" value="hello"/>'

    const field = t.$('#foo') as HTMLInputElement

    const isMac = t.env.isMac

    await t.type('#foo', 'a', { [ isMac ? 'metaKey' : 'ctrlKey' ] : true } )

    t.expect(t.getSelectedText(field)).toBe("hello")
    t.expect(field.value).toBe("hello")

    await t.type('#foo', 'Abra')

    t.expect(field.value).toBe("Abra")
})
