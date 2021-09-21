import { beforeEach, it } from "../../../browser.js"
import { createPositionedElement, createPositionedIframe } from "../../@helpers.js"

beforeEach(() => {
    document.body.innerHTML = ''
})

it('Clicking on the elements inside of the iframe should work', async t => {
    const iframe                    = await createPositionedIframe('about:blank', { left : 50, top : 50, width : 300, height : 300 })
    iframe.style.backgroundColor    = 'blue'

    const iframeDoc             = iframe.contentDocument

    const div                   = createPositionedElement('div', { left : 100, top : 100, width : 100, height : 100 }, iframeDoc)

    div.style.backgroundColor   = 'green'

    iframeDoc.body.appendChild(div)

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


// // TODO https://github.com/microsoft/playwright/issues/9029
// it({ title : 'Should not freeze when moving mouse above foreign-domain iframe', isTodo : true }, async t => {
//     document.body.innerHTML = '<iframe></iframe>'
//
//     const frame = document.querySelector('iframe')
//     frame.setAttribute('src', "https://www.theworldsworstwebsiteever.com/")
//
//     t.firesOnce(document.documentElement, 'click')
//
//     await t.click('iframe')
// })
