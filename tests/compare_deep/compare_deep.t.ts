import { it } from "../../main.js"
import { CI } from "../../src/iterator/Iterator.js"
import {
    any,
    anyInstanceOf,
    anyNumberApprox,
    compareDeepGen,
    DifferenceObject,
    DifferenceReachability,
    DifferenceSet,
    DifferenceTypesAreDifferent,
    DifferenceValuesAreDifferent,
    PathSegment
} from "../../src/util/CompareDeep.js"


it('Deep compare should work for primitives and non-cyclic data structures', async t => {
    t.isDeeply(CI(compareDeepGen(1, 1)).toArray(), [])

    t.isDeeply(CI(compareDeepGen(1, '1')).toArray(), [ DifferenceTypesAreDifferent.new({ v1 : 1, v2 : '1', type1 : 'Number', type2 : 'String' }) ])

    t.isDeeply(CI(compareDeepGen(1, 2)).toArray(), [ DifferenceValuesAreDifferent.new({ v1 : 1, v2 : 2 }) ])

    t.isDeeply(
        CI(compareDeepGen({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1 })).toArray(),
        []
    )

    t.isDeeply(
        CI(compareDeepGen({ prop1 : 1, prop2 : 2 }, { prop2 : 3, prop1 : 1 })).toArray(),
        [ DifferenceValuesAreDifferent.new({ v1 : 2, v2 : 3, keyPath : [ PathSegment.new({ type : 'object_key', key : 'prop2' }) ] }) ]
    )

    t.isDeeply(
        CI(compareDeepGen({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1, prop3 : 3 })).toArray(),
        [
            DifferenceObject.new({
                object1         : { prop1 : 1, prop2 : 2 },
                object2         : { prop2 : 2, prop1 : 1, prop3 : 3 },

                common1         : [ 'prop1', 'prop2' ],
                common2         : [ 'prop1', 'prop2' ],

                onlyIn1         : new Set([]),
                onlyIn2         : new Set([ 'prop3' ]),

                keyPath         : []
            })
        ]
    )
})


it('Deep compare should work for number placeholders', async t => {
    t.isDeeply(CI(compareDeepGen(10, anyNumberApprox(10))).toArray(), [])

    //------------------------
    const placeholder   = anyNumberApprox(10)

    t.isDeeply(
        CI(compareDeepGen('10', placeholder)).toArray(),
        [ DifferenceTypesAreDifferent.new({ v1 : '10', v2 : placeholder, type1 : 'String', type2 : 'Number' }) ]
    )
})


it('Deep compare should work for instance placeholders', async t => {
    t.isDeeply(CI(compareDeepGen(10, anyInstanceOf(Number))).toArray(), [])

    t.isDeeply(CI(compareDeepGen(new Date, anyInstanceOf(Date))).toArray(), [])

    t.isDeeply(CI(compareDeepGen(new Date, anyInstanceOf(Object))).toArray(), [])

    t.isDeeply(CI(compareDeepGen([ 1, 2, 3 ], anyInstanceOf(Array))).toArray(), [])

    t.isDeeply(CI(compareDeepGen(() => {}, anyInstanceOf(Function))).toArray(), [])

    //------------------------
    const placeholder   = anyInstanceOf(Date)

    t.isDeeply(
        CI(compareDeepGen('10', placeholder)).toArray(),
        [ DifferenceValuesAreDifferent.new({ v1 : '10', v2 : placeholder }) ]
    )

})


it('Deep compare should work for any placeholders', async t => {
    t.isDeeply(CI(compareDeepGen(10, any())).toArray(), [])

    t.isDeeply(CI(compareDeepGen(new Date, any())).toArray(), [])

    t.isDeeply(CI(compareDeepGen([ 1, 2, 3 ], any())).toArray(), [])
})


it('Deep compare should work with sets of objects', async t => {
    const a1    = new Set([ { a : 1 } ])
    const a2    = new Set([ { a : 1 } ])

    t.isDeeply(CI(compareDeepGen(a1, a2)).toArray(), [])

    //----------------
    const b1    = new Set([ { a : 1 } ])
    const b2    = new Set([ { b : 1 } ])

    t.isDeeply(CI(compareDeepGen(b1, b2)).toArray(), [
        DifferenceSet.new({
            set1            : b1,
            set2            : b2,

            common1         : [],
            common2         : [],

            onlyIn1         : new Set([ { a : 1 } ]),
            onlyIn2         : new Set([ { b : 1 } ]),

            keyPath         : []
        })
    ])

    //----------------
    const c1    = new Set([ { a : 1 } ])
    const c2    = new Set([ { a : 1 }, { b : 1 } ])

    t.isDeeply(CI(compareDeepGen(c1, c2)).toArray(), [
        DifferenceSet.new({
            set1            : c1,
            set2            : c2,

            common1         : [ { a : 1 } ],
            common2         : [ { a : 1 } ],

            onlyIn1         : new Set(),
            onlyIn2         : new Set([ { b : 1 } ]),

            keyPath         : []
        })
    ])

})


it('Deep compare should work with maps with key objects', async t => {
    const a1    = new Map([ [ { a : 1 }, 1 ] ])
    const a2    = new Map([ [ { a : 1 }, 1 ] ])

    t.isDeeply(CI(compareDeepGen(a1, a2)).toArray(), [])
})


it('Deep compare should work with circular data structures', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    t.isDeeply(CI(compareDeepGen(a1, a2)).toArray(), [])

    const a3    = { a : a2 }

    t.isDeeply(CI(compareDeepGen(a1, a3)).toArray(), [ DifferenceReachability.new({
        keyPath : [
            PathSegment.new({ type : 'object_key', key : 'a' })
        ],
        v1      : a1,
        v2      : a3.a,
        v1Path  : [],
        v2Path  : undefined
    }) ])


    //----------------
    const b11   = { next : undefined }
    const b21   = { prev : undefined }

    b11.next    = b21
    b21.prev    = b11

    const c11   = { next : undefined }
    const c21   = { prev : undefined }

    c11.next    = c21
    c21.prev    = c11

    t.isDeeply(CI(compareDeepGen(b11, c11)).toArray(), [])

    //----------------
    const d1    = new Set([ b11, b21 ])
    const d2    = new Set([ c11, c21 ])

    t.isDeeply(CI(compareDeepGen(d1, d2)).toArray(), [])
})
