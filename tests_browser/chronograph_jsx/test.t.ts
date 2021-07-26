import { it } from "../../browser.js"

it('Annotation rendering', async t => {
    t.is({ obj : 1 }, 2)

    t.isDeeply(1, 2)

    t.fail('pass')

    // t.isDeeply([ 1, 2, 3 ], [ 1, 2 ])
})

