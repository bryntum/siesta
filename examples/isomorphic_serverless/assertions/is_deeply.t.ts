import { describe } from "../../../main.js"
import { delay } from "../../../src/util/Helpers.js"

describe('`isDeeply`assertion should work', async t => {

    // await delay(500)
    //
    // t.it('Compare primitives', t => {
    //     t.isDeeply(1, 1)
    //
    //     t.isDeeply("1", "1")
    //
    //     // @ts-ignore
    //     t.isDeeply(1, '2')
    // })


    t.it('Compare arrays', t => {
        // t.isDeeply({ prop : { another : [ 1 ] } }, { prop : { another : [ 2 ] } })

        t.isDeeply([ 1, 2, 3, 4 ], [ 2, 2 ])

        // t.isDeeply([ 1 ], [ 1, 2, 3 ])
        //
        // t.isDeeply([], [ 1, 2, 3 ])
    })


    // t.it('Compare objects', t => {
    //     t.isDeeply({}, {})
    //
    //     t.isDeeply({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1 })
    //
    //     t.isDeeply({ prop1 : 1, prop2 : 2, prop3 : 3 }, { prop2 : 2, prop1 : 1, prop4 : 4 })
    //
    //     t.isDeeply({ prop1 : 1, prop2 : 2, prop3 : 3, prop4 : 4, prop5 : 5, prop6 : 6 }, {})
    // })
    //
    //
    // t.it('Compare sets', t => {
    //     t.isDeeply(new Set(), new Set())
    //
    //     t.isDeeply(new Set([ 1 ]), new Set([ 1 ]))
    //
    //     t.isDeeply(new Set([ 1, 2, 3, 4 ]), new Set([ 1, 2 ]))
    //
    //     t.isDeeply(new Set([ 1, 2, 3, 4 ]), new Set([ 0, 1, 2, 3 ]))
    // })
    //
    //
    // t.it('Compare maps', t => {
    //     t.isDeeply(new Map(), new Map())
    //
    //     t.isDeeply(new Map([ [ 1, 1 ] ]), new Map([ [ 1, 1 ] ]))
    //
    //     t.isDeeply(new Map([ [ {}, 1 ] ]), new Map([ [ {}, 1 ] ]))
    //
    //     t.isDeeply(new Map([ [ 1, 1 ], [ 2, 2 ] ]), new Map([ [ 2, 2 ], [ 1, 1 ] ]))
    //
    //     t.isDeeply(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), new Map([ [ 1, 1 ], [ 4, 4 ] ]))
    //
    //     t.isDeeply(new Map([ [ { a : 1 }, 1 ], [ {}, 2 ], [ {}, 3 ] ]), new Map([ [ { a : 1 }, 4 ], [ {}, 3 ] ]))
    // })
    //
    //
    // t.it('Compare functions', t => {
    //     const identity      = i => i
    //     const increment     = i => {
    //         return i++
    //     }
    //
    //     t.isDeeply(identity, identity)
    //     t.isDeeply(identity, increment)
    // })
    //
    //
    // t.it('Compare dates', t => {
    //     const date  = new Date()
    //
    //     t.isDeeply(date, new Date(date))
    //
    //     t.isDeeply(date, new Date(Date.now() + 1000))
    // })
    //
    //
    // t.it('Compare regular expressions', t => {
    //     const regexp  = /reg exp/
    //
    //     t.isDeeply(/reg exp/, /reg exp/)
    //
    //     t.isDeeply(/reg exp/, /reg exp/gm)
    // })
    //
    //
    // t.it('Compare cyclic structures', t => {
    //     const a1    = { a : undefined }
    //     a1.a        = a1
    //
    //     const a2    = { a : undefined }
    //     a2.a        = a2
    //
    //     t.isDeeply(a1, a2)
    //
    //     const a3    = { a : a2 }
    //
    //     t.isDeeply(a1, a3)
    //
    //     //----------------
    //     const b11   = { next : undefined }
    //     const b21   = { prev : undefined }
    //
    //     b11.next    = b21
    //     b21.prev    = b11
    //
    //     const c11   = { next : undefined }
    //     const c21   = { prev : undefined }
    //
    //     c11.next    = c21
    //     c21.prev    = b11
    //
    //     t.isDeeply(b11, c11)
    //
    //     //----------------
    //     const d1    = new Set([ b11, b21 ])
    //     const d2    = new Set([ c11, c21 ])
    //
    //     t.isDeeply(d1, d2)
    //
    // })
})

