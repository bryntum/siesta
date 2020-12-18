import { describe } from "../../../main.js"

describe('`isDeeply`assertion should work', async t => {
    t.isDeeply(1, 1)

    // @ts-ignore
    t.isDeeply(1, '2')

    t.isDeeply({ prop : { another : [ 1 ] } }, { prop : { another : [ 2 ] } })

    t.isDeeply([ 1, 2, 3, 4 ], [ 2, 2 ])

    t.isDeeply([ 1 ], [ 1, 2, 3 ])

    t.isDeeply([], [ 1, 2, 3 ])
})

