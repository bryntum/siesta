import { it } from "../../index.js"
import { MIN_SMI } from "../../src/util/Helpers.js"
import { compact, Uniqable } from "../../src/util/Uniqable.js"

const getUniqable   = () => { return { uniqable : MIN_SMI } }

it('Compacting arrays should work', async t => {
    const el1   = getUniqable()
    const el2   = getUniqable()
    const el3   = getUniqable()

    const elements : Uniqable[]     = [ el1, el2, el1, el3, el1, el2, el3 ]

    compact(elements)

    t.equal(elements, [ el1, el2, el3 ])

    //--------------------------
    // trying to compact the same array
    elements.push(el1, el1, el2, el2, el3, el3)

    compact(elements)

    t.equal(elements, [ el1, el2, el3 ])
})
