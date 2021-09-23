import { beforeEach, describe, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should move caret when using arrow keys', async t => {
    document.body.innerHTML = '<input id="inp" type="text"/>'

    const field = document.getElementById('inp') as HTMLInputElement

    await t.type(field, 'faa[LEFT][LEFT]')

    t.is(t.getCaretPosition(field), 1, 'LEFT key stepped left')

    await t.type([], '[RIGHT][RIGHT]')

    t.is(t.getCaretPosition(field), 3, 'RIGHT key stepped right')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should move caret to edge of text selection when using arrow keys, if text is selected', async t => {
    document.body.innerHTML = '<input id="inp" type="text" value="aXXa"/>'

    const field = document.getElementById('inp') as HTMLInputElement

    //------------------
    t.selectText('#inp', 1, 4)

    t.is(t.getSelectedText(field), 'aXXa', 'Text selected correctly')

    await t.type('#inp', '[LEFT]')

    t.false(t.getSelectedText(field), 'Text no longer selected')
    t.is(t.getCaretPosition(field), 0, 'LEFT key stepped to beginning of selection')

    //------------------
    t.selectText('#inp', 1, 4)

    await t.type('#inp', '[RIGHT]')

    t.false(t.getSelectedText(field), 'Text no longer selected')

    t.is(t.getCaretPosition(field), 4, 'RIGHT key stepped to end of selection')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should move caret position on HOME/END keys', async t => {
    document.body.innerHTML = '<input type="text" id="foo" value="rd"/>'

    await t.type('#foo', '[HOME]ne[END]y')

    const input     = t.$('#foo') as HTMLInputElement

    t.expect(input.value).toBe('nerdy')
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
