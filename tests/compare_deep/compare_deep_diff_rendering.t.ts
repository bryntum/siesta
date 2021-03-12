import { it } from "../../index.js"
import { compareDeepDiff } from "../../src/compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/CompareDeepDiffRendering.js"


it('Should render the array diff correctly', async t => {
    const renderer      = XmlRendererDifference.new()

    //------------------
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

    // t.eqDiff([ { a : 1 }, 4, 5 ], [ 3 ])
})


it('Should render the object diff correctly', async t => {
    const renderer      = XmlRendererDifference.new()

    //------------------
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

    //------------------
    const difference4   = compareDeepDiff({ a : 1, b : 2, d : 4 }, { a : 1, c : 3, e : 5 })

    t.is(
        renderer.renderToString(difference4.template()),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            '{         │ │ {        ',
            '  "a": 1, │ │   "a": 1,',
            '  "b": 2, │ │   ░      ',
            '  "d": 4  │ │   ░      ',
            '  ░       │ │   "c": 3,',
            '  ░       │ │   "e": 5 ',
            '}         │ │ }        ',
        ].join('\n')
    )

    //------------------
    const difference5   = compareDeepDiff({ a : 1, b : { c : 2, d : 4 } }, { a : 1, b : { c : 3, e : 5 } })

    t.is(
        renderer.renderToString(difference5.template()),
        [
            'Received    │ │ Expected   ',
            '            │ │            ',
            '{           │ │ {          ',
            '  "a": 1,   │ │   "a": 1,  ',
            '  "b": {    │ │   "b": {   ',
            '    "c": 2, │ │     "c": 3,',
            '    "d": 4  │ │     ░      ',
            '    ░       │ │     "e": 5 ',
            '  }         │ │   }        ',
            '}           │ │ }          ',
        ].join('\n')
    )

    // t.eqDiff({ a : 1, b : { c : 2, d : 4 } }, { a : 1, b : { c : 3, e : 5 } })
})


it('Should render the set diff correctly', async t => {
    const renderer      = XmlRendererDifference.new()

    //------------------
    const difference1   = compareDeepDiff(new Set([ 1, 2 ]), new Set([ 2, 3 ]))

    t.is(
        renderer.renderToString(difference1.template()),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            'Set (2) { │ │ Set (2) {',
            '  2,      │ │   2,     ',
            '  1       │ │   ░      ',
            '  ░       │ │   3      ',
            '}         │ │ }        ',
        ].join('\n')
    )


    // t.eqDiff({ a : 1, b : { c : 2, d : 4 } }, { a : 1, b : { c : 3, e : 5 } })
})
