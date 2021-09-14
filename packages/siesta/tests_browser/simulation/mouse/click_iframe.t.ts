import { it } from "../../../browser.js"
import { createPositionedElement, createPositionedIframe } from "../../@helpers.js"


it('Clicking on the elements inside of the iframe should work', async t => {
    const iframe            = await createPositionedIframe('about:blank', { left : 50, top : 50, width : 300, height : 300 })
    iframe.style.border     = '2px solid blue'
    iframe.style.boxSizing  = 'border-box'

    const iframeDoc     = iframe.contentDocument

    const div           = createPositionedElement('div', { left : 100, top : 100, width : 100, height : 100 }, iframeDoc)

    div.style.border    = '2px solid green'
    div.style.boxSizing = 'border-box'

    iframeDoc.body.appendChild(div)

    debugger

    let counter         = 0

    div.addEventListener('click', e => {
        t.is(e.clientX, 150, 'event coordinates should always be local to containing frame')
        t.is(e.clientY, 150, 'event coordinates should always be local to containing frame')

        counter++
    })

    await t.click(div)

    t.is(counter, 1, 'One click event detected')

    t.equal(t.simulator.currentPosition, [ 200, 200 ], 'Current position should be relative to top scope')
})
