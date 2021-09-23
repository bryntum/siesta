import { beforeEach, it } from "../../../browser.js"
import { extractKeysAndSpecialKeys } from "../../../src/siesta/simulate/SimulatorKeyboard.js"

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

    t.firesOnce(field, [ 'keydown', 'keypress', 'keyup', 'input', 'beforeinput' ])
    // there's also `textInput` event which has been removed from the spec more than 10 years ago, ignoring it

    // DOM "value" property should not be set yet, at the point when 'beforeinput' is fired
    field.addEventListener('beforeinput', () => t.expect(field.value).toBe(''))

    field.addEventListener('keydown', () => t.expect(field.value).toBe(''))
    field.addEventListener('keypress', () => t.expect(field.value).toBe(''))
    field.addEventListener('keyup', () => t.expect(field.value).toBe('a'))

    // DOM "value" property should be set at the point when 'input' is fired
    field.addEventListener('input', () => t.expect(field.value).toBe('a'))

    await t.type(field, 'a')

    t.expect(field.value).toBe('a')
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
it('Should be able to type printable non-letters chars', async t => {
    document.body.innerHTML = '<input id="inp1" style="width: 800px" type="text"/>'

    const inp1      = t.$('#inp1') as HTMLInputElement
    const keys      = "~!@#$%^&*()_+`-={}[]|\\:\";',./<>? abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

    const keysSet   = new Set(keys.split(''))

    inp1.addEventListener('keypress', event => keysSet.delete(event.key))

    t.willFireNTimes(inp1, [ 'keydown', 'keyup', 'keypress' ], keys.length)

    await t.type(inp1, keys)

    t.expect(inp1.value).toBe(keys)

    t.equal(keysSet, new Set(), 'Should be no unpressed keys')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not fire keypress for certain special characters, like BACKSPACE, ESCAPE, etc', async t => {
    document.body.innerHTML = '<input id="inp1" type="text"/>'

    const inp1      = t.$('#inp1') as HTMLInputElement

    const text      = 'abc[BACKSPACE][DELETE][ESCAPE][SHIFT][CTRL][ALT][META][ARROWLEFT][ARROWRIGHT][ARROWUP][ARROWDOWN][HOME][END][F4]'
    const split     = extractKeysAndSpecialKeys(text)

    t.firesOk(inp1, { 'keydown' : split.length, 'keyup' : split.length, 'keypress' : 3 })

    await t.type(inp1, text)

    t.expect(inp1.value).toBe("ab")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should handle UP, DOWN on a NumberField', async t => {
    document.body.innerHTML = '<input type="number" id="inp1" min="10" max="100" value="10">'

    const field1    = t.$('#inp1') as HTMLInputElement

    await t.type('#inp1', "[UP][UP][DOWN][UP]")

    t.expect(field1.value).toBe("12")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should provide "key" property for special key', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const input             = t.$('#foo') as HTMLInputElement

    const assertKeyValue    = (e : KeyboardEvent) => t.expect(e.key).toBe('Escape')

    input.addEventListener('keydown', assertKeyValue)
    input.addEventListener('keyup', assertKeyValue)

    t.firesOnce(input, [ 'keydown', 'keyup' ])

    await t.type('#foo', '[ESCAPE]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should provide "key" property for regular key', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const input             = t.$('#foo') as HTMLInputElement

    const assertKeyValue    = (e : KeyboardEvent) => t.expect(e.key).toBe('a')

    input.addEventListener('keydown', assertKeyValue)
    input.addEventListener('keyup', assertKeyValue)
    input.addEventListener('keypress', assertKeyValue)

    t.firesOnce(input, [ 'keydown', 'keyup', 'keypress' ])

    await t.type('#foo', 'a')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should honor the `maxlength` attribute and still trigger the events for rejected characters', async t => {
    document.body.innerHTML = '<input type="text" maxlength="8" id="foo"/>'

    const input             = t.$('#foo') as HTMLInputElement

    t.willFireNTimes(input, [ 'keydown', 'keyup', 'keypress' ], 10)

    await t.type('#foo', '1234567890')

    t.is(input.value, '12345678', "`maxlength` attribute was honored")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not change the field value if `keydown` event has prevented the default action', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const input             = t.$('#foo') as HTMLInputElement

    input.addEventListener('keydown', e => e.preventDefault())

    t.firesOk(input, { 'keydown' : 3, 'keyup' : 3, 'keypress' : 0 }, 'Should not fire `keypress` is keydown is prevented')

    await t.type('#foo', '123')

    t.is(input.value, '', "Field value did not change")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not change the field value if `keypress` event has prevented the default action', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const input             = t.$('#foo') as HTMLInputElement

    input.addEventListener('keypress', e => e.preventDefault())

    t.firesOk(input, { 'keydown' : 3, 'keyup' : 3, 'keypress' : 3 }, 'Should fire `keyup` is `keypress` is prevented')

    await t.type('#foo', '123')

    t.is(input.value, '', "Field value did not change")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be possible to clear existing value when typing', async t => {
    document.body.innerHTML =
        '<input id="txt2" type="text" value="bar">' +
        '<input id="txt3" type="text" value="bar">'

    await t.type('#txt2', 'foo', { clearExisting : true })
    await t.type('#txt3', '', { clearExisting : true })

    const txt2      = t.$('#txt2') as HTMLInputElement
    const txt3      = t.$('#txt3') as HTMLInputElement

    t.expect(txt2.value).toBe('foo')
    t.expect(txt3.value).toBe('')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be possible to type regular text in square brackets', async t => {
    document.body.innerHTML = '<input type="text" id="inp"/>'

    const input      = t.$('#inp') as HTMLInputElement

    await t.type(input, '[test]')
    t.expect(input.value).toBe('[test]')

    await t.type(input, '[[something]]', { clearExisting : true })
    t.expect(input.value).toBe('[[something]]')

    await t.type(input, '[[F3]]', { clearExisting : true })
    t.expect(input.value).toBe('[F3]')

    await t.type(input, '[[[F3]]]', { clearExisting : true })
    t.expect(input.value).toBe('[[F3]]')

    await t.type(input, '[[[BACKSPACE]]', { clearExisting : true })
    t.expect(input.value).toBe('[[BACKSPACE]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should wait for target before typing', async t => {
    setTimeout(() => {
        document.body.innerHTML = '<input id="field1" type="text"/>'
    }, 100)

    await t.type('#field1', 'value')

    const field1      = t.$('#field1') as HTMLInputElement

    t.is(field1.value, "value")
})
