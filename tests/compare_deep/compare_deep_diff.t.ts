import { it, iit } from "../../index.js"
import { compareDeepDiff, Difference, DifferenceArray, DifferenceObject, DifferenceObjectType } from "../../src/compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/CompareDeepDiffRendering.js"


it('Deep compare of primitives should work', async t => {
    t.equal(compareDeepDiff(1, 1), Difference.new({ value1 : 1, value2 : 1, same : true }))

    t.equal(compareDeepDiff("string", "string"), Difference.new({ value1 : "string", value2 : "string", same : true }))
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

        common          : [],

        onlyIn1         : new Set(),
        onlyIn2         : new Set(),

        comparisons     : new Map()
    }))

    t.equal(compareDeepDiff({ a : 1 }, { a : 1 }), DifferenceObject.new({
        same            : true,

        value1          : { a : 1 },
        value2          : { a : 1 },

        common          : [ 'a' ],

        onlyIn1         : new Set(),
        onlyIn2         : new Set(),

        comparisons     : new Map([
            [ "a", { type : 'common' as DifferenceObjectType, difference : Difference.new({ value1 : 1, value2 : 1, same : true }) } ]
        ])
    }))


    t.equal(compareDeepDiff({ a : 1, b : 3 }, { a : 2, c : 4 }), DifferenceObject.new({
        same            : false,

        value1          : { a : 1, b : 3 },
        value2          : { a : 2, c : 4 },

        common          : [ 'a' ],

        onlyIn1         : new Set([ 'b' ]),
        onlyIn2         : new Set([ 'c' ]),

        comparisons     : new Map([
            [ "a", { type : 'common' as DifferenceObjectType, difference : Difference.new({ value1 : 1, value2 : 2 }) } ],
            [ "b", { type : 'onlyIn1' as DifferenceObjectType, difference : Difference.new({ value1 : 3 }) } ],
            [ "c", { type : 'onlyIn2' as DifferenceObjectType, difference : Difference.new({ value2 : 4 }) } ]
        ])
    }))
})


it('Should render the array diff correctly', async t => {
    const renderer      = XmlRendererDifference.new()

    const difference1   = compareDeepDiff([ 1, 1 ], [ 0, 0 ])

    t.is(
        renderer.renderToString(difference1.template()),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ [       ',
            '  1,     │0│   0,    ',
            '  1      │1│   0     ',
            ']        │ │ ]       '
        ].join('\n')
    )

    //------------------
    const difference2   = compareDeepDiff([ { a : 1 } ], [ 3 ])

    t.is(
        renderer.renderToString(difference2.template()),
        [
            'Received   │ │ Expected',
            '           │ │         ',
            '[          │ │ [       ',
            '  {        │0│   3     ',
            '    "a": 1 │ │         ',
            '  }        │ │         ',
            ']          │ │ ]       '
        ].join('\n')
    )

    //------------------
    const difference3   = compareDeepDiff([ { a : 1 }, { b : 2 } ], [ 3, 4 ])

    t.is(
        renderer.renderToString(difference3.template()),
        [
            'Received   │ │ Expected',
            '           │ │         ',
            '[          │ │ [       ',
            '  {        │0│   3,    ',
            '    "a": 1 │ │         ',
            '  },       │ │         ',
            '  {        │1│   4     ',
            '    "b": 2 │ │         ',
            '  }        │ │         ',
            ']          │ │ ]       '
        ].join('\n')
    )

    //------------------
    const difference4   = compareDeepDiff([ { a : 1 }, 3, 4 ], [ { a : 1 }, 2 ])

    t.is(
        renderer.renderToString(difference4.template()),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            '[          │ │ [         ',
            '  {        │0│   {       ',
            '    "a": 1 │ │     "a": 1',
            '  },       │ │   },      ',
            '  3,       │1│   2,      ',
            '  4        │2│   ░       ',
            ']          │ │ ]         '
        ].join('\n')
    )

    //------------------
    const difference5   = compareDeepDiff([ 3, { a : 1 }, { b : 2 } ], [ 2 ])

    t.is(
        renderer.renderToString(difference5.template()),
        [
            'Received   │ │ Expected',
            '           │ │         ',
            '[          │ │ [       ',
            '  3,       │0│   2,    ',
            '  {        │1│   ░,    ',
            '    "a": 1 │ │         ',
            '  },       │ │         ',
            '  {        │2│   ░     ',
            '    "b": 2 │ │         ',
            '  }        │ │         ',
            ']          │ │ ]       '
        ].join('\n')
    )


    t.eqDiff([ { a : 1 }, 4, 5 ], [ 3 ])
})


it('Should render the object diff correctly', async t => {
    const renderer      = XmlRendererDifference.new()
    const difference1   = compareDeepDiff({ a : 1 }, { a : 2 })

    t.is(
        renderer.renderToString(difference1.template()),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '{        │ │ {       ',
            '  "a": 1 │ │   "a": 2',
            '}        │ │ }       ',
        ].join('\n')
    )

    //------------------
    const difference2   = compareDeepDiff({ a : 1 }, { b : 2 })

    t.is(
        renderer.renderToString(difference2.template()),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '{        │ │ {       ',
            '  "a": 1 │ │   ░     ',
            '  ░      │ │   "b": 2',
            '}        │ │ }       ',
        ].join('\n')
    )


    //------------------
    const difference3   = compareDeepDiff({ a : 1, b : 2 }, { a : 1, c : 3 })

    t.is(
        renderer.renderToString(difference3.template()),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            '{         │ │ {        ',
            '  "a": 1, │ │   "a": 1,',
            '  "b": 2  │ │   ░      ',
            '  ░       │ │   "c": 3 ',
            '}         │ │ }        ',
        ].join('\n')
    )

    // t.eqDiff([ { a : 1 }, 4, 5 ], [ 3 ])
})
