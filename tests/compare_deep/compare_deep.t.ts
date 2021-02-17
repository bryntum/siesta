import { it } from "../../index.js"
import {
    any,
    anyInstanceOf,
    anyNumberApprox,
    anyStringLike,
    compareDeep,
    DifferenceObject,
    DifferenceReachability,
    DifferenceSet,
    DifferenceTypesAreDifferent,
    DifferenceValuesAreDifferent,
    PathSegment
} from "../../src/util/CompareDeep.js"


it('Deep compare should work for primitives and non-cyclic data structures', async t => {
    t.equal(compareDeep(1, 1), [])

    t.equal(compareDeep(1, '1'), [ DifferenceTypesAreDifferent.new({ v1 : 1, v2 : '1', type1 : 'Number', type2 : 'String' }) ])

    t.equal(compareDeep(1, 2), [ DifferenceValuesAreDifferent.new({ v1 : 1, v2 : 2 }) ])

    t.equal(
        compareDeep({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1 }),
        []
    )

    t.equal(
        compareDeep({ prop1 : 1, prop2 : 2 }, { prop2 : 3, prop1 : 1 }),
        [ DifferenceValuesAreDifferent.new({ v1 : 2, v2 : 3, keyPath : [ PathSegment.new({ type : 'object_key', key : 'prop2' }) ] }) ]
    )

    t.equal(
        compareDeep({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1, prop3 : 3 }),
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
    t.equal(compareDeep(10, anyNumberApprox(10)), [])

    t.equal(compareDeep(10.5, anyNumberApprox(10)), [])

    t.equal(compareDeep(10.1, anyNumberApprox(10, { percent : 1 })), [])

    t.equal(compareDeep(1.0512, anyNumberApprox(1.051, { digits : 3 })), [])

    t.equal(compareDeep(1.1599999, anyNumberApprox(1.15, { digits : 2 })), [])

    //------------------------
    const placeholder   = anyNumberApprox(10)

    t.equal(
        compareDeep('10', placeholder),
        [ DifferenceTypesAreDifferent.new({ v1 : '10', v2 : placeholder, type1 : 'String', type2 : 'Number' }) ]
    )

    //------------------------
    const placeholder2   = anyNumberApprox(1.05, { digits : 2 })

    t.equal(
        compareDeep(1.061, placeholder2),
        [ DifferenceValuesAreDifferent.new({ v1 : 1.061, v2 : placeholder2 }) ]
    )

    //------------------------
    const placeholder3   = anyNumberApprox(1.03, { percent : 2 })

    t.equal(
        compareDeep(1, placeholder3),
        [ DifferenceValuesAreDifferent.new({ v1 : 1, v2 : placeholder3 }) ]
    )
})


it('Deep compare should work for string placeholders', async t => {
    t.equal(compareDeep('10', anyStringLike('1')), [])
    t.equal(compareDeep('FOO', anyStringLike(/foo/i)), [])

    //------------------------
    const placeholder   = anyStringLike(/foo/i)

    t.equal(
        compareDeep(1, placeholder),
        [ DifferenceTypesAreDifferent.new({ v1 : 1, v2 : placeholder, type1 : 'Number', type2 : 'String' }) ]
    )

    t.equal(
        compareDeep('bar', placeholder),
        [ DifferenceValuesAreDifferent.new({ v1 : 'bar', v2 : placeholder }) ]
    )
})


it('Deep compare should work for instance placeholders', async t => {
    t.equal(compareDeep(false, anyInstanceOf(Boolean)), [])

    t.equal(compareDeep('foo', anyInstanceOf(String)), [])

    t.equal(compareDeep(10, anyInstanceOf(Number)), [])

    t.equal(compareDeep(new Date, anyInstanceOf(Date)), [])

    t.equal(compareDeep(new Date, anyInstanceOf(Object)), [])

    t.equal(compareDeep({}, anyInstanceOf(Object)), [])

    t.equal(compareDeep([ 1, 2, 3 ], anyInstanceOf(Array)), [])

    t.equal(compareDeep(() => {}, anyInstanceOf(Function)), [])

    //------------------------
    const placeholder   = anyInstanceOf(Date)

    t.equal(
        compareDeep('10', placeholder),
        [ DifferenceValuesAreDifferent.new({ v1 : '10', v2 : placeholder }) ]
    )

})


it('Deep compare should work for any placeholders', async t => {
    t.equal(compareDeep(10, any()), [])

    t.equal(compareDeep(new Date, any()), [])

    t.equal(compareDeep([ 1, 2, 3 ], any()), [])
})


it('Deep compare should work with sets of objects', async t => {
    const a1    = new Set([ { a : 1 } ])
    const a2    = new Set([ { a : 1 } ])

    t.equal(compareDeep(a1, a2), [])

    //----------------
    const b1    = new Set([ { a : 1 } ])
    const b2    = new Set([ { b : 1 } ])

    t.equal(compareDeep(b1, b2), [
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

    t.equal(compareDeep(c1, c2), [
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

    t.equal(compareDeep(a1, a2), [])
})


it('Deep compare should work with circular data structures', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    t.equal(compareDeep(a1, a2), [])

    const a3    = { a : a2 }

    t.equal(compareDeep(a1, a3), [ DifferenceReachability.new({
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

    t.equal(compareDeep(b11, c11), [])

    //----------------
    const d1    = new Set([ b11, b21 ])
    const d2    = new Set([ c11, c21 ])

    t.equal(compareDeep(d1, d2), [])
})
