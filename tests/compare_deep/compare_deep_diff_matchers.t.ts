import { it } from "../../index.js"
import { compareDeepDiff, DifferenceAtomic } from "../../src/compare_deep/CompareDeepDiff.js"
import { any, anyInstanceOf, anyNumberApprox, anyStringLike } from "../../src/compare_deep/FuzzyMatcherDiff.js"


it('Deep compare should work for number placeholders', async t => {
    debugger

    t.eqDiff(compareDeepDiff(10, anyNumberApprox(10)), DifferenceAtomic.new({ value1 : 10, value2 : anyNumberApprox(10), same : true }))

    // t.equal(compareDeepDiff(10.5, anyNumberApprox(10)), [])
    //
    // t.equal(compareDeepDiff(10.1, anyNumberApprox(10, { percent : 1 })), [])
    //
    // t.equal(compareDeepDiff(1.0512, anyNumberApprox(1.051, { digits : 3 })), [])
    //
    // t.equal(compareDeepDiff(1.1599999, anyNumberApprox(1.15, { digits : 2 })), [])
    //
    // //------------------------
    // const placeholder   = anyNumberApprox(10)
    //
    // t.equal(
    //     compareDeepDiff('10', placeholder),
    //     [ DifferenceTypesAreDifferent.new({ v1 : '10', v2 : placeholder, type1 : 'String', type2 : 'Number' }) ]
    // )
    //
    // //------------------------
    // const placeholder2   = anyNumberApprox(1.05, { digits : 2 })
    //
    // t.equal(
    //     compareDeepDiff(1.061, placeholder2),
    //     [ DifferenceValuesAreDifferent.new({ v1 : 1.061, v2 : placeholder2 }) ]
    // )
    //
    // //------------------------
    // const placeholder3   = anyNumberApprox(1.03, { percent : 2 })
    //
    // t.equal(
    //     compareDeepDiff(1, placeholder3),
    //     [ DifferenceValuesAreDifferent.new({ v1 : 1, v2 : placeholder3 }) ]
    // )
})


// it('Deep compare should work for string placeholders', async t => {
//     t.equal(compareDeepDiff('10', anyStringLike('1')), [])
//     t.equal(compareDeepDiff('FOO', anyStringLike(/foo/i)), [])
//
//     //------------------------
//     const placeholder   = anyStringLike(/foo/i)
//
//     t.equal(
//         compareDeepDiff(1, placeholder),
//         [ DifferenceTypesAreDifferent.new({ v1 : 1, v2 : placeholder, type1 : 'Number', type2 : 'String' }) ]
//     )
//
//     t.equal(
//         compareDeepDiff('bar', placeholder),
//         [ DifferenceValuesAreDifferent.new({ v1 : 'bar', v2 : placeholder }) ]
//     )
// })
//
//
// it('Deep compare should work for instance placeholders', async t => {
//     t.equal(compareDeepDiff(false, anyInstanceOf(Boolean)), [])
//
//     t.equal(compareDeepDiff('foo', anyInstanceOf(String)), [])
//
//     t.equal(compareDeepDiff(10, anyInstanceOf(Number)), [])
//
//     t.equal(compareDeepDiff(new Date, anyInstanceOf(Date)), [])
//
//     t.equal(compareDeepDiff(new Date, anyInstanceOf(Object)), [])
//
//     t.equal(compareDeepDiff({}, anyInstanceOf(Object)), [])
//
//     t.equal(compareDeepDiff([ 1, 2, 3 ], anyInstanceOf(Array)), [])
//
//     t.equal(compareDeepDiff(() => {}, anyInstanceOf(Function)), [])
//
//     //------------------------
//     const placeholder   = anyInstanceOf(Date)
//
//     t.equal(
//         compareDeepDiff('10', placeholder),
//         [ DifferenceValuesAreDifferent.new({ v1 : '10', v2 : placeholder }) ]
//     )
//
// })
//
//
// it('Deep compare should work for any placeholders', async t => {
//     t.equal(compareDeepDiff(10, any()), [])
//
//     t.equal(compareDeepDiff(new Date, any()), [])
//
//     t.equal(compareDeepDiff([ 1, 2, 3 ], any()), [])
// })
