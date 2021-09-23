import { it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// see https://code.google.com/p/selenium/issues/detail?id=4801
// also https://support.saucelabs.com/customer/en/portal/private/cases/31771
const isFocused     = (sel : string) : boolean => document.querySelector(`${ sel }`) === document.activeElement

const setupField    = (id : string) => {
    const el            = document.getElementById(id) as HTMLInputElement

    const logListener   = (e : Event) => log.push(e.type + "/" + id);

    [ 'keydown', 'keypress', 'keyup', 'blur', 'focus' ].forEach(eventName => el.addEventListener(eventName, logListener))

    return el
}

let log : string[] = []
let field1 : HTMLInputElement, field2 : HTMLInputElement, field3 : HTMLInputElement

const doSetup       = async () => {
    document.body.innerHTML =
        '<input style="width:100px;" id="field1"></input>' +
        '<input style="width:100px;" id="field2"></input>' +
        '<input style="width:100px;" id="field3"></input>'

    field1      = setupField('field1')
    field2      = setupField('field2')
    field3      = setupField('field3')

    field1.focus()

    log         = []
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Tabbing should cause `keydown/keyup` to be fired on different elements', async t => {
    await doSetup()

    await t.type('#field1', '[TAB][TAB]')

    t.equal(log, [
        'keydown/field1',
        'blur/field1',
        'focus/field2',
        'keyup/field2',
        'keydown/field2',
        'blur/field2',
        'focus/field3',
        'keyup/field3'
    ])
})

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Preventing `keydown` event should also prevent the focus change', async t => {
    await doSetup()

    field1.addEventListener('keydown', e => e.preventDefault())

    await t.type('#field1', '[TAB]')

    t.is(document.activeElement, field1, "Focus has not changed")

    t.equal(log, [
        'keydown/field1',
        'keyup/field1'
    ], 'Should not fire keypress if keydown is cancelled')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Tabbing should work', async t => {
    document.body.innerHTML     = '<div><input id="one" type="text"></div><input id="two" type="password"><textarea id="three"></textarea>';

    (t.$('#one') as HTMLElement).focus()
    t.true(isFocused("#one"), 'Field 1 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.true(isFocused("#two"), 'Field 2 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.true(isFocused("#three"), 'Field 3 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]', { shiftKey : true })

    t.true(isFocused("#two"), 'Field 2 focused after SHIFT+TAB')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.true(isFocused("#three"), 'Field 3 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.false(isFocused("#three"), 'Field 3 not focused')
    t.false(isFocused("#two"), 'Field 2 not focused')
    t.false(isFocused("#one"), 'Field 1 not focused')

    t.is(document.activeElement, document.body, 'Body focused')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Tabbing should work #2', async t => {
    document.body.innerHTML =
        '<input tabindex=3 id="one" type="text" value="one"><br>' +
        '<input tabindex=2 id="two" type="password" value="two"><br>' +
        '<textarea tabindex=1 id="three">three</textarea><br>' +
        '<input id="four" value="four">';

    (t.$('#three') as HTMLElement).focus()

    t.true(isFocused("#three"), 'Field 3 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.true(isFocused("#two"), 'Field 2 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.true(isFocused("#one"), 'Field 1 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.true(isFocused("#four"), 'Field 4 focused')

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await t.type([], '[TAB]')

    t.false(isFocused("#one"), 'Field 1 not focused')
    t.false(isFocused("#two"), 'Field 2 not focused')
    t.false(isFocused("#three"), 'Field 3 not focused')
    t.false(isFocused("#four"), 'Field 4 not focused')

    t.is(document.activeElement, document.body, 'Body focused')
})
