import { it } from "../../browser.js"

it('Annotation rendering', async t => {
    // @ts-ignore
    t.is({ obj : 1 }, 2)

    t.isDeeply(1, 2)

    t.fail('pass')

    t.isDeeply([ 1, 2, 3 ], [ 1, 2 ])
})


it('isDeeply rendering', async t => {
    t.isDeeply([ 1, 2, 3 ], [ 1, 2 ])
})

