import { it } from "../../../browser.js"
import { normalizeOffset } from "../../../src/util_browser/Coordinates.js"
import { createPositionedElement } from "../../@helpers.js"


it('Should support offset expressions', async t => {
    const div   = createPositionedElement('div', { left : 10, top : 10, width : 40, height : 40 })

    document.body.appendChild(div)

    t.equal(normalizeOffset(div), [ 20, 20 ])

    t.equal(normalizeOffset(div, [ '10%', '10%' ]), [ 4, 4 ])

    t.equal(normalizeOffset(div, [ '10% + 1', '10%-1' ]), [ 5, 3 ])
})

