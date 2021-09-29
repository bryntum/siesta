import { beforeEach, it } from "../../../browser.js"
import { createElement, createPositionedIframe } from "../../@helpers.js"

const id    = id => document.getElementById(id)

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should work #1', t => {
    t.equal(t.query('body'), [ document.body ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should work #2', t => {
    document.body.innerHTML = '<div id="div1"></div><div id="div2"></div>'

    t.equal(t.query('div'), [ id('div1'), id('div2') ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should support `root` argument', t => {
    document.body.innerHTML =
        '<div id="div">' +
            '<span id="span"></span>' +
        '</div>' +
        '<span></span>'

    t.equal(t.query('span', id('div')), [ id('span') ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should support `->` symbol for targeting elements inside the iframe', async t => {
    const iframe1   = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 100, height : 100 })
    iframe1.id      = 'iframe1'

    const iframe2   = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 100, height : 100 })
    iframe2.id      = 'iframe2'

    t.equal(t.query('iframe -> body'), [ iframe1.contentDocument.body, iframe2.contentDocument.body ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should support `->` symbol for targeting elements inside the iframe, nested', async t => {
    const iframe1   = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 100, height : 100 })
    iframe1.className = 'iframe'

    const iframe1_1 = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 100, height : 100 }, iframe1.contentDocument)

    const nested1_1 = iframe1_1.contentDocument.body.appendChild(createElement({ class : 'nested' }))

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const iframe2   = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 100, height : 100 })
    iframe2.className = 'iframe'

    const iframe2_1 = await createPositionedIframe('about:blank', { left : 0, top : 0, width : 100, height : 100 }, iframe2.contentDocument)

    const nested2_1 = iframe2_1.contentDocument.body.appendChild(createElement({ class : 'nested' }))

    t.equal(t.query('.iframe -> iframe -> .nested'), [ nested1_1, nested2_1 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class WebComp extends HTMLElement {
    constructor () {
        super()

        this.attachShadow({ mode : 'open' })
    }
}

class WebComp2 extends HTMLElement {
    constructor () {
        super()

        this.attachShadow({ mode : 'open' })
    }
}

window.customElements.define('web-comp', WebComp)
window.customElements.define('web-comp2', WebComp2)


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should support `->` symbol for targeting elements inside the web component', async t => {
    const webComp1  = new WebComp()
    const div1      = webComp1.shadowRoot.appendChild(createElement({}))

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const webComp2  = new WebComp()
    const div2      = webComp2.shadowRoot.appendChild(createElement({}))

    document.body.appendChild(webComp1)
    document.body.appendChild(webComp2)

    t.equal(t.query('web-comp -> div'), [ div1, div2 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`query` method should support `->` symbol for targeting elements inside the web component, nested', async t => {
    const webComp1      = new WebComp()
    webComp1.className  = 'web-comp'

    const webComp11     = webComp1.shadowRoot.appendChild(new WebComp2())
    const div1          = webComp11.shadowRoot.appendChild(createElement({}))

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const webComp2      = new WebComp()
    webComp2.className  = 'web-comp'

    const webComp21     = webComp2.shadowRoot.appendChild(new WebComp2())
    const div2          = webComp21.shadowRoot.appendChild(createElement({}))

    document.body.appendChild(webComp1)
    document.body.appendChild(webComp2)

    t.equal(t.query('.web-comp -> web-comp2 -> div'), [ div1, div2 ])
})


