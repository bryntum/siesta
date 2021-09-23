import { it } from "../../../browser.js"
import { createPositionedIframe } from "../../@helpers.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Typing in the elements inside of the iframe should work', async t => {
    const iframe        = await createPositionedIframe('about:blank', { left : 50, top : 50, width : 300, height : 300 })
    iframe.style.border = '1px solid blue'

    const iframeDoc     = iframe.contentDocument

    const input         = iframeDoc.createElement('input')

    iframeDoc.body.appendChild(input)

    await t.type(input, 'foobar')

    t.is(input.value, 'foobar', 'Correct text typed in the input field')
})
