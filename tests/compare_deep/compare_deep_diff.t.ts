import { it } from "../../index.js"
import { compareDeepGen, DifferenceArray, DifferenceDifferent, DifferenceMissing, DifferenceSame } from "../../src/compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/CompareDeepDiffRendering.js"


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


it('Should render the diff correctly', async t => {
    const renderer      = XmlRendererDifference.new()
    const difference1   = compareDeepGen([ 1, 1 ], [ 0, 0 ])

    t.is(
        renderer.renderToString(difference1.template()),
        [
            '[    │ │ [   ',
            '  1, │0│   0,',
            '  1  │1│   0 ',
            ']    │ │ ]   '
        ].join('\n')
    )

    const difference2   = compareDeepGen([ { a : 1 } ], [ 3 ])

    t.is(
        renderer.renderToString(difference2.template()),
        [
            '[          │ │ [  ',
            '  {        │0│   3',
            '    "a": 1 │ │    ',
            '  }        │ │    ',
            ']          │ │ ]  '
        ].join('\n')
    )

    const difference3   = compareDeepGen([ { a : 1 }, { b : 2 } ], [ 3, 4 ])

    t.is(
        renderer.renderToString(difference3.template()),
        [
            '[          │ │ [   ',
            '  {        │0│   3,',
            '    "a": 1 │ │     ',
            '  },       │ │     ',
            '  {        │1│   4 ',
            '    "b": 2 │ │     ',
            '  }        │ │     ',
            ']          │ │ ]   '
        ].join('\n')
    )
})
