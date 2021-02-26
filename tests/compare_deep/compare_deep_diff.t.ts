import { it } from "../../index.js"
import { compareDeepDiff, DifferenceArray, DifferenceDifferent, DifferenceMissing, DifferenceSame } from "../../src/compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/CompareDeepDiffRendering.js"


it('Deep compare should work ', async t => {
    t.equal(compareDeepDiff([ 1 ], [ 1 ]), DifferenceSame.new({ value : [ 1 ] }))

    t.equal(compareDeepDiff([ 1 ], [ 0 ]), DifferenceArray.new({
        length1         : 1,
        length2         : 1,

        comparisons     : [
            { index : 0, difference : DifferenceDifferent.new({ v1 : 1, v2 : 0 }) }
        ]
    }))

    t.equal(compareDeepDiff([], [ 1 ]), DifferenceArray.new({
        length1         : 0,
        length2         : 1,

        comparisons     : [
            { index : 0, difference : DifferenceMissing.new({ value : 1, from : '2' }) }
        ]
    }))
})


it('Should render the diff correctly', async t => {
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


    t.eqDiff([ { a : 1 } ], [ 3 ])
})
