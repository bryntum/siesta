import { it } from "../../index.js"
import {
    compareDeepDiff,
    Difference,
    DifferenceArray,
    DifferenceObject,
    DifferenceObjectType,
    DifferenceSet
} from "../../src/compare_deep/CompareDeepDiff.js"


it('Deep compare of primitives should work', async t => {
    t.equal(compareDeepDiff(1, 1), Difference.new({ value1 : 1, value2 : 1, same : true }))

    t.equal(compareDeepDiff("string", "string"), Difference.new({ value1 : "string", value2 : "string", same : true }))

    t.equal(compareDeepDiff(1, '1'), Difference.new({ value1 : 1, value2 : '1' }))

    t.equal(compareDeepDiff(/a/, /a/), Difference.new({ value1 : /a/, value2 : /a/, same : true }))

    t.equal(compareDeepDiff(/a/, /a/i), Difference.new({ value1 : /a/, value2 : /a/i, same : false }))
})


it('Deep compare of arrays should work', async t => {
    t.equal(compareDeepDiff([ 1 ], [ 0 ]), DifferenceArray.new({
        value1          : [ 1 ],
        value2          : [ 0 ],

        same            : false,

        comparisons     : [
            { index : 0, difference : Difference.new({ value1 : 1, value2 : 0 }) }
        ]
    }))

    t.equal(compareDeepDiff([ 1, 1 ], [ 1, 0 ]), DifferenceArray.new({
        value1          : [ 1, 1 ],
        value2          : [ 1, 0 ],

        same            : false,

        comparisons     : [
            { index : 0, difference : Difference.new({ value1 : 1, value2 : 1, same : true }) },
            { index : 1, difference : Difference.new({ value1 : 1, value2 : 0 }) },
        ]
    }))

    t.equal(compareDeepDiff([], [ 1 ]), DifferenceArray.new({
        value1          : [],
        value2          : [ 1 ],

        same            : false,

        comparisons     : [
            { index : 0, difference : Difference.new({ value2 : 1 }) }
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
            { key : "a", type : 'common' as DifferenceObjectType, difference : Difference.new({ value1 : 1, value2 : 1, same : true }) }
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
            { key : "a", type : 'common' as DifferenceObjectType, difference : Difference.new({ value1 : 1, value2 : 2 }) },
            { key : "b", type : 'onlyIn1' as DifferenceObjectType, difference : Difference.new({ value1 : 3 }) },
            { key : "c", type : 'onlyIn2' as DifferenceObjectType, difference : Difference.new({ value2 : 4 }) }
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
            { type : "common", difference : Difference.new({ value1 : 2, value2 : 2, same : true }) },
            { type : "common", difference : Difference.new({ value1 : 3, value2 : 3, same : true }) },
            { type : "onlyIn1", difference : Difference.new({ value1 : 1 }) },
            { type : "onlyIn2", difference : Difference.new({ value2 : 4 }) },
        ]
    }))
})
