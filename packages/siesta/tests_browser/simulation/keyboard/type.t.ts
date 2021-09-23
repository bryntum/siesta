import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Simulating "type" user action should work', async t => {
    document.body.innerHTML = '<input id="inp" type="text" value=""/>'

    const field = document.getElementById('inp') as HTMLInputElement

    await t.type(field, 'fzx[BACKSPACE]zf')

    t.is(field.value, 'fzzf', 'Input value is correct')

    await t.type('#inp', '[BACKSPACE][BACKSPACE]')

    t.is(field.value, 'fz', 'Correctly resolved the string action target for typing')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire all type of key/input events', async t => {
    document.body.innerHTML = '<input id="inp" type="text"/>'

    const field = document.getElementById('inp') as HTMLInputElement

    t.firesOnce(field, 'keydown')
    t.firesOnce(field, 'keypress')
    t.firesOnce(field, 'keyup')
    t.firesOnce(field, 'input')
    t.firesOnce(field, 'beforeinput')
    // there's also `textInput` event which has been removed from the spec more than 10 years ago, ignoring it

    // DOM "value" property should not be set yet, at the point when 'beforeinput' is fired
    field.addEventListener('beforeinput', () => t.expect(field.value).toBe(''))

    // DOM "value" property should be set at the point when 'input' is fired
    field.addEventListener('input', () => t.expect(field.value).toBe('a'))

    await t.type(field, 'a')

    t.expect(field.value).toBe('a')
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
it('Should fire click when hitting ENTER on a link', async t => {
    document.body.innerHTML = '<a href="#" tabindex="1">testing link</a>'

    const rawLink   = t.$('a')

    t.firesOnce(rawLink, 'click')

    await t.type(rawLink, '[ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire click when hitting ENTER on a link #2', async t => {
    document.body.innerHTML     = '<a href="javascript:void(0)" id="anchor">Click me</a>'

    const anchor                = document.getElementById('anchor')

    anchor.addEventListener('keypress', () => {
        anchor.style.position   = 'absolute'
        anchor.style.left       = '-1000px'
        anchor.style.top        = '-1000px'
    })

    t.firesOnce(anchor, 'click')

    const prevCurrentPosition   = t.simulator.currentPosition.slice()

    await t.type('#anchor', '[ENTER]')

    t.equal(t.simulator.currentPosition, prevCurrentPosition, "Current cursor position has not changed")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should handle a focus change on "keydown" event', async t => {
    document.body.innerHTML = '<input id="inp1" type="text"/>' +
        '<input id="inp2" type="text"/>'

    const field1    = t.$('#inp1') as HTMLInputElement
    const field2    = t.$('#inp2') as HTMLInputElement

    field1.addEventListener('keydown', () => field2.focus())

    await t.type(field1, 'abc')

    t.is(field2.value, 'abc')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire keydown, keypress, keyup for all keys', async t => {
    document.body.innerHTML = '<input id="inp1" style="width: 800px" type="text"/>'

    const inp1      = t.$('#inp1') as HTMLInputElement
    const keys      = "~!@#$%^&*()_+`-={}[]:\";',./<>? abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

    const keysSet   = new Set(keys.split(''))

    inp1.addEventListener('keypress', event => keysSet.delete(event.key))

    t.willFireNTimes(inp1, [ 'keydown', 'keyup', 'keypress' ], keys.length)

    await t.type(inp1, keys)

    t.expect(inp1.value).toBe(keys)

    t.equal(keysSet, new Set(), 'Should be no unpressed keys')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not fire keypress for certain special characters, like BACKSPACE', async t => {
    document.body.innerHTML = '<input id="inp1" type="text"/>'

    const inp1      = t.$('#inp1') as HTMLInputElement

    t.firesOk(inp1, { 'keydown' : 4, 'keyup' : 4, 'keypress' : 3 })

    await t.type(inp1, 'abc[BACKSPACE]')

    t.expect(inp1.value).toBe("ab")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should handle UP, DOWN on a NumberField', async t => {
    document.body.innerHTML = '<input type="number" id="inp1" min="10" max="100" value="10">'

    const field1    = t.$('#inp1') as HTMLInputElement

    await t.type('#inp1', "[UP][UP][DOWN][UP]")

    t.expect(field1.value).toBe("12")
})


