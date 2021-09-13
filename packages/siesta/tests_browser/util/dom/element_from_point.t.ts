import { it } from "../../../browser.js"
import { elementFromPoint } from "../../../src/util_browser/Dom.js"
import { createPositionedIframe, createPositionedElement } from "../../@helpers.js"


class WebComponent extends HTMLElement {
    constructor () {
        super()
        this.attachShadow({ 'mode': 'open' })
    }
}

customElements.define('web-comp', WebComponent)


it('Element from point should work for nested iframes', async t => {
    document.body.innerHTML     = ''

    const iframe1       = await createPositionedIframe(document, 'about:blank', { left : 50, top : 50, width : 200, height : 200 })
    iframe1.style.backgroundColor   = 'red'

    const iframe2       = await createPositionedIframe(iframe1.contentDocument, 'about:blank', { left : 50, top : 50, width : 100, height : 100 })
    iframe2.style.backgroundColor   = 'green'

    const div1          = createPositionedElement('div', { left : 40, top : 40, width : 20, height : 20 }, iframe2.contentDocument)
    div1.style.backgroundColor      = 'blue'
    iframe2.contentDocument.body.appendChild(div1)

    t.equal(elementFromPoint(document, 60, 60, false), { el : iframe1, localXY : [ 60, 60 ] })

    t.equal(elementFromPoint(document, 60, 60, true), { el : iframe1.contentDocument.body, localXY : [ 10, 10 ] })

    t.equal(elementFromPoint(document, 110, 110, true), { el : iframe2.contentDocument.body, localXY : [ 10, 10 ] })

    t.equal(elementFromPoint(document, 150, 150, true), { el : div1, localXY : [ 50, 50 ] })
})

// it seems the `elementFromPoint` method of the shadow root instance does not work (at all) as intuitively expected
// see https://github.com/canonic-epicure/chrome_element_from_point_bug_repro

// it('Element from point should work for web components', async t => {
//     document.body.innerHTML     = ''
//
//     const webComp1      = await createPositionedElement(document, 'web-comp', { left : 50, top : 50, width : 200, height : 200 })
//
//     webComp1.style.backgroundColor   = 'red'
//     document.body.appendChild(webComp1)
//
//     const webComp2      = await createPositionedElement(document, 'web-comp', { left : 50, top : 50, width : 100, height : 100 })
//
//     webComp2.style.backgroundColor   = 'green'
//     webComp1.shadowRoot.appendChild(webComp2)
//
//     t.equal(elementFromPoint(document, 60, 60, true), { el : webComp1, localXY : [ 60, 60 ] })
//
//     t.equal(elementFromPoint(document, 60, 60, false), { el : webComp1.shadowRoot.firstElementChild, localXY : [ 10, 10 ] })
//
//     // t.equal(elementFromPoint(document, 150, 150, false), { el : webComp2.shadowRoot.firstElementChild, localXY : [ 50, 50 ] })
// })
