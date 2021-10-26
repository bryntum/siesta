import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be possible to press modifier keys when typing', async t => {
    // TODO: https://github.com/microsoft/playwright/issues/9755
    const isFirefox     = t.env.browser === 'firefox'

    document.body.innerHTML = '<input id="txt" type="text">'

    const field     = t.$('#txt') as HTMLInputElement

    const doAssert  = (e : KeyboardEvent) => {
        if (e.key === 'z') {
            t.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.true(e.shiftKey, e.type + ': Shift key detected')
            t.true(e.altKey, e.type + ': Alt key detected')
            !isFirefox && t.true(e.metaKey, e.type + ': Meta key detected')
        }
    }

    field.addEventListener('keydown', doAssert)
    field.addEventListener('keypress', doAssert)
    field.addEventListener('keyup', doAssert)

    await t.type('#txt', 'z', { shiftKey : true, ctrlKey : true, altKey : true, metaKey : !isFirefox })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not type any chars when Cmd/Ctrl are pressed', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const field     = t.$('#foo') as HTMLInputElement

    const isMac = t.env.isMac

    await t.type('#foo', 'z', { [ isMac ? 'metaKey' : 'ctrlKey' ] : true })

    t.expect(field.value).toBe('')
})

