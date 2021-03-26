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


it('Deep compare should work for string fuzzy matcher', async t => {
    t.equal(compareDeepDiff('10', anyStringLike('1')).same, true)

    t.equal(compareDeepDiff('FOO', anyStringLike(/foo/i)).same, true)


    t.equal(compareDeepDiff(1, anyStringLike(/foo/i)).same, false)

    t.equal(compareDeepDiff('bar', anyStringLike(/foo/i)).same, false)
})


it('Deep compare should work for "instance" fuzzy matcher', async t => {
    t.equal(compareDeepDiff(false, anyInstanceOf(Boolean)).same, true)

    t.equal(compareDeepDiff('foo', anyInstanceOf(String)).same, true)

    t.equal(compareDeepDiff(10, anyInstanceOf(Number)).same, true)

    t.equal(compareDeepDiff(new Date, anyInstanceOf(Date)).same, true)

    t.equal(compareDeepDiff(new Date, anyInstanceOf(Object)).same, true)

    t.equal(compareDeepDiff({}, anyInstanceOf(Object)).same, true)

    t.equal(compareDeepDiff([ 1, 2, 3 ], anyInstanceOf(Array)).same, true)

    t.equal(compareDeepDiff(() => {}, anyInstanceOf(Function)).same, true)

    t.equal(compareDeepDiff('10', anyInstanceOf(Date)).same, false)
})


it('Deep compare should work for "any" fuzzy matcher', async t => {
    t.equal(compareDeepDiff(10, any()).same, true)

    t.equal(compareDeepDiff(new Date, any()).same, true)

    t.equal(compareDeepDiff([ 1, 2, 3 ], any()).same, true)
})
