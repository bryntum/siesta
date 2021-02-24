import { it } from "../../index.js"
import { compareDeepGen, DifferenceArray, DifferenceDifferent, DifferenceMissing, DifferenceSame } from "../../src/compare_deep/CompareDeepDiff.js"


it('Deep compare should work ', async t => {
    t.equal(compareDeepGen([ 1 ], [ 1 ]), DifferenceSame.new({ value : [ 1 ] }))

    t.equal(compareDeepGen([ 1 ], [ 0 ]), DifferenceArray.new({
        length1         : 1,
        length2         : 1,

        comparisons     : [
            { index : 0, difference : DifferenceDifferent.new({ v1 : 1, v2 : 0 }) }
        ]
    }))

    t.equal(compareDeepGen([], [ 1 ]), DifferenceArray.new({
        length1         : 0,
        length2         : 1,

        comparisons     : [
            { index : 0, difference : DifferenceMissing.new({ value : 1, from : '2' }) }
        ]
    }))

})

