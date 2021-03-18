import { it } from "../../index.js"
import {
    compareDeepDiff,
    DifferenceAtomic,
    DifferenceArray,
    DifferenceMap,
    DifferenceObject, DifferenceReference,
    DifferenceSet, DifferenceHeterogeneous
} from "../../src/compare_deep/CompareDeepDiff.js"


it('Deep compare of primitives should work', async t => {
    t.equal(compareDeepDiff(1, 1), DifferenceAtomic.new({ value1 : 1, value2 : 1, same : true }))

    t.equal(compareDeepDiff("string", "string"), DifferenceAtomic.new({ value1 : "string", value2 : "string", same : true }))

    t.equal(compareDeepDiff(1, '1'), DifferenceHeterogeneous.new({
        value1 : DifferenceAtomic.new({ value1 : 1 }),
        value2 : DifferenceAtomic.new({ value2 : '1' }),
    }))

    t.equal(compareDeepDiff(/a/, /a/), DifferenceAtomic.new({ value1 : /a/, value2 : /a/, same : true }))

    t.equal(compareDeepDiff(/a/, /a/i), DifferenceAtomic.new({ value1 : /a/, value2 : /a/i, same : false }))
})


it('Deep compare of arrays should work', async t => {
    t.equal(compareDeepDiff([ 1 ], [ 0 ]), DifferenceArray.new({
        value1          : [ 1 ],
        value2          : [ 0 ],

        same            : false,

        comparisons     : [
            { index : 0, difference : DifferenceAtomic.new({ value1 : 1, value2 : 0 }) }
        ]
    }))

    t.equal(compareDeepDiff([ 1, 1 ], [ 1, 0 ]), DifferenceArray.new({
        value1          : [ 1, 1 ],
        value2          : [ 1, 0 ],

        same            : false,

        comparisons     : [
            { index : 0, difference : DifferenceAtomic.new({ value1 : 1, value2 : 1, same : true }) },
            { index : 1, difference : DifferenceAtomic.new({ value1 : 1, value2 : 0 }) },
        ]
    }))

    t.equal(compareDeepDiff([], [ 1 ]), DifferenceArray.new({
        value1          : [],
        value2          : [ 1 ],

        same            : false,

        comparisons     : [
            { index : 0, difference : DifferenceAtomic.new({ value2 : 1 }) }
        ]
    }))
})


it('Deep compare of objects should work', async t => {
    t.equal(compareDeepDiff({}, {}), DifferenceObject.new({
        same            : true,

        value1          : {},
        value2          : {},

        // common          : [],
        //
        // onlyIn1         : new Set(),
        // onlyIn2         : new Set(),

        comparisons     : []
    }))

    t.equal(compareDeepDiff({ a : 1 }, { a : 1 }), DifferenceObject.new({
        same            : true,

        value1          : { a : 1 },
        value2          : { a : 1 },

        // common          : [ { el1 : 'a', el2 : 'a', difference : null } ],
        //
        // onlyIn1         : new Set(),
        // onlyIn2         : new Set(),

        comparisons     : [
            { key : "a", difference : DifferenceAtomic.new({ value1 : 1, value2 : 1, same : true }) }
        ]
    }))

    t.equal(compareDeepDiff({ a : 1, b : 3 }, { a : 2, c : 4 }), DifferenceObject.new({
        same            : false,

        value1          : { a : 1, b : 3 },
        value2          : { a : 2, c : 4 },

        // common          : [ { el1 : 'a', el2 : 'a', difference : null } ],
        //
        // onlyIn1         : new Set([ 'b' ]),
        // onlyIn2         : new Set([ 'c' ]),

        comparisons     : [
            { key : "a", difference : DifferenceAtomic.new({ value1 : 1, value2 : 2 }) },
            { key : "b", difference : DifferenceAtomic.new({ value1 : 3 }) },
            { key : "c", difference : DifferenceAtomic.new({ value2 : 4 }) }
        ]
    }))
})


it('Deep compare of sets should work', async t => {
    t.equal(compareDeepDiff(new Set(), new Set()), DifferenceSet.new({
        same            : true,

        value1          : new Set(),
        value2          : new Set(),

        comparisons     : []
    }))

    t.equal(compareDeepDiff(new Set([ 1, 2, 3 ]), new Set([ 2, 3, 4 ])), DifferenceSet.new({
        same            : false,

        value1          : new Set([ 1, 2, 3 ]),
        value2          : new Set([ 2, 3, 4 ]),

        comparisons     : [
            { type : "common", difference : DifferenceAtomic.new({ value1 : 2, value2 : 2, same : true }) },
            { type : "common", difference : DifferenceAtomic.new({ value1 : 3, value2 : 3, same : true }) },
            { type : "onlyIn1", difference : DifferenceAtomic.new({ value1 : 1 }) },
            { type : "onlyIn2", difference : DifferenceAtomic.new({ value2 : 4 }) },
        ]
    }))
})


it('Deep compare of maps should work', async t => {
    t.equal(compareDeepDiff(new Map(), new Map()), DifferenceMap.new({
        same            : true,

        value1          : new Map(),
        value2          : new Map(),

        comparisons     : []
    }))

    t.equal(compareDeepDiff(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], ]), new Map([ [ 2, 2 ], [ 3, 3 ], [ 4, 4 ], ])), DifferenceMap.new({
        same            : false,

        value1          : new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], ]),
        value2          : new Map([ [ 2, 2 ], [ 3, 3 ], [ 4, 4 ], ]),

        comparisons     : [
            {
                type                : "common",
                differenceKeys      : DifferenceAtomic.new({ value1 : 2, value2 : 2, same : true }),
                differenceValues    : DifferenceAtomic.new({ value1 : 2, value2 : 2, same : true })
            },
            {
                type                : "common",
                differenceKeys      : DifferenceAtomic.new({ value1 : 3, value2 : 3, same : true }),
                differenceValues    : DifferenceAtomic.new({ value1 : 3, value2 : 3, same : true })
            },
            {
                type                : "onlyIn1",
                differenceKeys      : DifferenceAtomic.new({ value1 : 1 }),
                differenceValues    : DifferenceAtomic.new({ value1 : 1 })
            },
            {
                type                : "onlyIn2",
                differenceKeys      : DifferenceAtomic.new({ value2 : 4 }),
                differenceValues    : DifferenceAtomic.new({ value2 : 4 })
            }
        ]
    }))
})


it('Deep compare should work with circular data structures #1', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    t.equal(compareDeepDiff(a1, a2), DifferenceObject.new({
        same            : true,

        value1          : a1,
        value2          : a2,

        refId1          : 1,
        refId2          : 1,

        comparisons     : [
            { key : "a", difference : DifferenceReference.new({ value1 : 1, value2 : 1, same : true }) },
        ]
    }))
})


it('Deep compare should work with circular data structures #2', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    const a3    = { a : a2 }

    t.eqDiff(
        compareDeepDiff(a1, a3),
        DifferenceObject.new({
            value1  : a1,
            value2  : a3,
            reachability1   : undefined,
            reachability2   : undefined,
            refId1  : 1,
            refId2  : undefined,
            same    : false,
            comparisons     : [
                {
                    key     : "a",
                    difference  : DifferenceObject.new({
                        value1  : a1,
                        value2  : a2,
                        reachability1   : undefined,
                        reachability2   : undefined,
                        refId1  : undefined,
                        refId2  : 1,
                        same    : false,
                        comparisons     : [
                            {
                                key     : "a",
                                difference  : DifferenceReference.new({
                                    value1  : 1,
                                    value2  : 1,
                                    same    : false
                                })
                            }
                        ]
                    })
                }
            ]
        })
    )
})


// it('Deep compare should work with circular data structures #2', async t => {
//     const a     = [ { ref : null }, { ref : null } ]
//
//     a[ 0 ].ref  = a[ 1 ]
//     a[ 1 ].ref  = a[ 0 ]
//
//     const b     = [ { ref : null }, { ref : null } ]
//
//     b[ 0 ].ref  = b[ 1 ]
//     b[ 1 ].ref  = b[ 1 ]
//
//     t.eqDiff(compareDeepDiff(a, b), DifferenceArray.new({
//         same            : false,
//
//         value1          : a,
//         value2          : b,
//
//         comparisons     : [
//             {
//                 index           : 0,
//                 difference      : DifferenceObject.new({
//                     same    : false,
//
//                     value1  : a[ 0 ],
//                     value2  : b[ 0 ],
//
//                     comparisons : [
//                         {
//                             key             : 'ref',
//
//                             difference      : DifferenceObject.new({
//                                 same    : false,
//
//                                 value1  : a[ 1 ],
//                                 value2  : b[ 1 ],
//
//                                 comparisons : [
//                                     {
//                                         key             : 'ref',
//
//                                         difference      : Difference.new({
//                                             same            : false,
//                                             value1          : a[ 0 ],
//                                             value2          : b[ 1 ],
//                                             reachability1   : any(Number) as any as number,
//                                             reachability2   : any(Number) as any as number,
//                                         })
//                                     }
//                                 ]
//                             })
//                         }
//                     ]
//                 })
//             },
//             {
//                 index           : 1,
//                 difference      : Difference.new({
//                     same            : false,
//                     value1          : a[ 0 ],
//                     value2          : b[ 1 ],
//                     reachability1   : any(Number) as any as number,
//                     reachability2   : any(Number) as any as number,
//                 })
//             }
//         ]
//     }))
// })


// // it('Deep compare should work with circular data structures #3', async t => {
// //     const b11   = { next : undefined }
// //     const b21   = { prev : undefined }
// //
// //     b11.next    = b21
// //     b21.prev    = b11
// //
// //     const c11   = { next : undefined }
// //     const c21   = { prev : undefined }
// //
// //     c11.next    = c21
// //     c21.prev    = c11
// //
// //     t.equal(compareDeep(b11, c11), [])
// //
// //     //----------------
// //     const d1    = new Set([ b11, b21 ])
// //     const d2    = new Set([ c11, c21 ])
// //
// //     t.equal(compareDeep(d1, d2), [])
// // })
