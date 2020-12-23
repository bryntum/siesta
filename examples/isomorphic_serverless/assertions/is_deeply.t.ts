import { describe } from "../../../main.js"

describe('`isDeeply`assertion should work', t => {
    t.it('Compare primitives', t => {
        t.isDeeply(1, 1)

        t.isDeeply("1", "1")

        // @ts-ignore
        t.isDeeply(1, '2')
    })

    t.it('Compare arrays', t => {
        t.isDeeply({ prop : { another : [ 1 ] } }, { prop : { another : [ 2 ] } })

        t.isDeeply([ 1, 2, 3, 4 ], [ 2, 2 ])

        t.isDeeply([ 1 ], [ 1, 2, 3 ])

        t.isDeeply([], [ 1, 2, 3 ])
    })

    t.it('Compare objects', t => {
        t.isDeeply({}, {})

        t.isDeeply({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1 })

        t.isDeeply({ prop1 : 1, prop2 : 2, prop3 : 3 }, { prop2 : 2, prop1 : 1, prop4 : 4 })

        t.isDeeply({ prop1 : 1, prop2 : 2, prop3 : 3, prop4 : 4, prop5 : 5, prop6 : 6 }, {})
    })

    t.it('Compare sets', t => {
        t.isDeeply(new Set(), new Set())

        t.isDeeply(new Set([ 1 ]), new Set([ 1 ]))

        t.isDeeply(new Set([ 1, 2, 3, 4 ]), new Set([ 1, 2 ]))

        t.isDeeply(new Set([ 1, 2, 3, 4 ]), new Set([ 0, 1, 2, 3 ]))
    })

    t.it('Compare maps', t => {
        t.isDeeply(new Map(), new Map())

        t.isDeeply(new Map([ [ 1, 1 ] ]), new Map([ [ 1, 1 ] ]))

        t.isDeeply(new Map([ [ {}, 1 ] ]), new Map([ [ {}, 1 ] ]))

        t.isDeeply(new Map([ [ 1, 1 ], [ 2, 2 ] ]), new Map([ [ 2, 2 ], [ 1, 1 ] ]))

        t.isDeeply(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), new Map([ [ 1, 1 ], [ 4, 4 ] ]))

        t.isDeeply(new Map([ [ { a : 1 }, 1 ], [ {}, 2 ], [ {}, 3 ] ]), new Map([ [ { a : 1 }, 4 ], [ {}, 3 ] ]))
    })

    t.it('Compare functions', t => {
        const identity      = i => i
        const increment     = i => {
            return i++
        }

        t.isDeeply(identity, identity)
        t.isDeeply(identity, increment)
    })

    t.it('Compare dates', t => {
        const date  = new Date()

        t.isDeeply(date, date)

        t.isDeeply(date, new Date(Date.now() + 1000))
    })
})

