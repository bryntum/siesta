import { beforeEach, it } from "../../../browser.js"
import { createPositionedIframe } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support typing into element with "contentEditable" attribute set to "true"', async t => {
    document.body.innerHTML = '<div contentEditable="true" style="background: #ccc" class="foo"></div>'

    await t.type('.foo', 'foot[BACKSPACE]')

    t.is(t.$('.foo').innerHTML, 'foo')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to type into child nodes of an element that is contentEditable', async t => {
    document.body.innerHTML =
        '<pre>' +
            '<code contentEditable="true">Some text before <b class="foo" style="font-weight: bold">edit me</b>' +
            '</code>' +
        '</pre>'

    await t.click('code b', [ '100% - 1', '50%' ])

    await t.type('code b', '[BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE]new text')

    t.is(t.$('code b').innerHTML, 'new text', 'Node updated correctly')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to type into deeply nested childnodes of an element that is contentEditable', async t => {
    document.body.innerHTML =
        '<pre contentEditable="true">' +
            '<div>Some text before <br><div><b>BLARGH</b><span>Hello</span> <b class="foo">edit me</b></div></div>' +
        '</pre>'

    await t.click('div b.foo', [ '100% - 1', '50%' ])

    await t.type('div b.foo', '[BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE]ndurance')

    t.is(t.$('div b.foo').innerHTML, 'endurance', 'Node updated correctly')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// note, that waiting for selector like `pre:focus` is not robust sometimes:
// see https://code.google.com/p/selenium/issues/detail?id=4801
// also https://support.saucelabs.com/customer/en/portal/private/cases/31771
it('Click should focus "contentEditable" element', async t => {
    document.body.innerHTML = '<pre style="background: #aaa; height: 30px; width: 150px" contentEditable>foo bar baz</pre>'

    const pre       = t.$('pre')

    await t.click('pre')

    await t.waitFor(() => t.activeElement === pre)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support `designMode` on documents', async t => {
    const iframe    = await createPositionedIframe('about:blank', { left : 50, top : 50, width : 300, height : 400 })

    iframe.id       = 'iframe1'

    const doc       = iframe.contentDocument

    doc.designMode  = 'on'

    await t.type('#iframe1 -> body', 'bart[BACKSPACE]')

    t.is(doc.body.innerHTML, 'bar')
})
