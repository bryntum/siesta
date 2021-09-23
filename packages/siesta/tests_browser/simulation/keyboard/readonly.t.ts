import { beforeEach } from "../../../src/siesta/test/Test.js"
import { it } from "../../../src/siesta/test/TestBrowser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should simulate key events even if input is readonly', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" readonly/>'

    const inp1      = t.$('#inp1') as HTMLInputElement

    t.firesOnce(inp1, [ 'keydown', 'keypress', 'keyup' ])

    await t.type('#inp1', "a")

    t.is(inp1.value, '')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should NOT simulate key events if input is disabled', async t => {
    document.body.innerHTML = '<input id="inp1" type="text" disabled/>'

    const inp1      = t.$('#inp1') as HTMLInputElement

    t.wontFire(inp1, [ 'keydown', 'keypress', 'keyup' ])

    await t.type('#inp1', "a")

    t.is(inp1.value, '')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should respect readonly when text is selected', async t => {
    document.body.innerHTML = '<input type="text" id="foo" value="foo" readonly/>'

    t.selectText('#foo')

    await t.type('#foo', "a")

    const inp1      = t.$('#foo') as HTMLInputElement

    t.expect(inp1.value).toBe('foo')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should respect readonly when deleting using DELETE key', async t => {
    document.body.innerHTML = '<input type="text" id="foo" value="foo" readonly/>'

    await t.type('#foo', "[DELETE]")

    const inp1      = t.$('#foo') as HTMLInputElement

    t.expect(inp1.value).toBe('foo')
})
