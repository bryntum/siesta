// import { it } from "../../../browser.js"
// import { createPositionedElement, createPositionedIframe } from "../../@helpers.js"
//
// it('Clicking on the elements inside of the iframe should work', async t => {
//     const iframe        = await createPositionedIframe('about:blank', { left : 50, top : 50, width : 300, height : 300 })
//     iframe.style.border = '1px solid blue'
//
//     const iframeDoc     = iframe.contentDocument
//
//     const div           = createPositionedElement('div', { left : 100, top : 100, width : 100, height : 100 })
//
//     div.style.border    = '1px solid black'
//     div.innerHTML       = 'INNER'
//
//     // let input           = iframeDoc.createElement('input')
//
//     iframeDoc.body.appendChild(div)
//     // iframeDoc.body.appendChild(input)
//
//     // let counter         = 0
//     //
//     // div.onclick = function (e) {
//     //     t.isApprox(e.clientX, 150, 1, 'event coordinates should always be local to containing frame')
//     //     t.isApprox(e.clientY, 150, 1, 'event coordinates should always be local to containing frame')
//     //     counter++
//     // }
//     //
//     // t.chain(
//     //     { click       : div },
//     //     function (next) {
//     //         t.is(counter, 1, 'One click event detected')
//     //
//     //         t.isApprox(t.currentPosition[ 0 ], 200, 1, 'Current X-position should be relative to top scope')
//     //         t.isApprox(t.currentPosition[ 1 ], 200, 1, 'Current Y-position should be relative to top scope')
//     //
//     //         next()
//     //     },
//     //     {
//     //         target      : input,
//     //         type        : 'foobar'
//     //     },
//     //     function (next) {
//     //         t.is(input.value, 'foobar', 'Correct text typed in the input field')
//     //     }
//     // )
// })
