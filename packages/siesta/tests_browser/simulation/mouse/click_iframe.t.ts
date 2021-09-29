import { beforeEach, it } from "../../../browser.js"
import { createPositionedElement, createPositionedIframe } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Clicking on the elements inside of the iframe should work', async t => {
    let iframe : HTMLIFrameElement
    let div : HTMLDivElement

    t.beforeEach(async t => {
        iframe                          = await createPositionedIframe('about:blank', { left : 50, top : 50, width : 300, height : 300 })
        iframe.style.backgroundColor    = 'blue'

        const iframeDoc             = iframe.contentDocument

        div                         = createPositionedElement('div', { left : 100, top : 100, width : 100, height : 100 }, iframeDoc) as HTMLDivElement

        div.style.backgroundColor   = 'green'

        iframeDoc.body.appendChild(div)
    })

    t.it('Should support clicking using the element instance itself', async t => {
        div.addEventListener('click', e => {
            t.is(e.clientX, 150, 'event coordinates should always be local to containing frame')
            t.is(e.clientY, 150, 'event coordinates should always be local to containing frame')
        })

        t.firesOk(div, 'click', 1)

        await t.click(div)

        t.equal(t.simulator.currentPosition, [ 200, 200 ], 'Current position should be relative to top scope')
    })

    t.it('Should support clicking using the selector with `->`', async t => {
        div.addEventListener('click', e => {
            t.is(e.clientX, 150, 'event coordinates should always be local to containing frame')
            t.is(e.clientY, 150, 'event coordinates should always be local to containing frame')
        })

        t.firesOk(div, 'click', 1)

        await t.click('iframe -> div')

        t.equal(t.simulator.currentPosition, [ 200, 200 ], 'Current position should be relative to top scope')
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not freeze when moving mouse above foreign-domain iframe', async t => {
    document.body.innerHTML = '<iframe></iframe>'

    const frame = document.querySelector('iframe')

    await t.waitForEvent('iframe', 'load', { trigger : () => frame.setAttribute('src', "https://www.theworldsworstwebsiteever.com/") })

    await t.click('iframe')
})
