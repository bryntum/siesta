import { it } from "../../index.js"
import { compareDeepDiff, DifferenceAtomic, DifferenceHeterogeneous, DifferenceObject } from "../../src/compare_deep/CompareDeepDiff.js"
import { any, anyInstanceOf, anyNumberApprox, anyStringLike } from "../../src/compare_deep/FuzzyMatcherDiff.js"


it('Deep compare should work for number fuzzy matcher', async t => {
    t.equal(
        compareDeepDiff(10, anyNumberApprox(10)),
        DifferenceAtomic.new({ value1 : 10, value2 : anyNumberApprox(10), same : true })
    )

    t.equal(
        compareDeepDiff(10.5, anyNumberApprox(10)).same,
        true
    )

    t.equal(
        compareDeepDiff(10.1, anyNumberApprox(10, { percent : 1 })).same,
        true
    )

    t.equal(
        compareDeepDiff(1.0512, anyNumberApprox(1.051, { digits : 3 })).same,
        true
    )

    t.equal(
        compareDeepDiff(1.1599999, anyNumberApprox(1.15, { digits : 2 })).same,
        true
    )

    t.equal(
        compareDeepDiff(10.12, anyNumberApprox(10.123, { digits : 2 })).same,
        true
    )

    t.equal(
        compareDeepDiff(1.061, anyNumberApprox(1.05, { digits : 2 })).same,
        false
    )

    t.equal(
        compareDeepDiff(1, anyNumberApprox(1.03, { percent : 2 })).same,
        false
    )

    //------------------------
    const matcher   = anyNumberApprox(10)

    t.eqDiff(
        compareDeepDiff('10', matcher),
        DifferenceHeterogeneous.new({
            value1 : DifferenceAtomic.new({ value1 : '10' }),
            value2 : DifferenceObject.new({
                same    : false,
                value2 : matcher,
                comparisons : [
                    {
                        "key": "value",
                        "difference": DifferenceAtomic.new({
                            "value2": 10,
                            "same": false
                        })
                    },
                    {
                        "key": "approx",
                        "difference": DifferenceObject.new({
                            "value2": matcher.approx,
                            "same": false,
                            "onlyIn2Size": 0,
                            "comparisons": [
                                {
                                    "key": "percent",
                                    "difference": DifferenceAtomic.new({
                                        "value2": 5,
                                    })
                                },
                                {
                                    "key": "threshold",
                                    "difference": DifferenceAtomic.new({
                                        "value2": undefined,
                                    })
                                },
                                {
                                    "key": "digits",
                                    "difference": DifferenceAtomic.new({
                                        "value2": undefined,
                                    })
                                }
                            ]
                        })
                    }
                ]
            })
        })
    )
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
