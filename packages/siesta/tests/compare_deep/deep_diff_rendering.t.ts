import { it } from "../../index.js"
import { compareDeepDiff } from "../../src/compare_deep/DeepDiff.js"
import {
    any, anyArrayContaining,
    anyInstanceOf,
    anyNumberApprox,
    anyObjectContaining,
    anyStringLike
} from "../../src/compare_deep/DeepDiffFuzzyMatcher.js"
import { XmlRendererDifference } from "../../src/compare_deep/DeepDiffXmlRendererDifference.js"

const rendererPlain     = XmlRendererDifference.new({})
// strip zero-width spaces
const stripZws          = (str : string) => str.replace(/\u200B/g, '')


it('Should render the array diff correctly #1', async t => {
    const difference0   = compareDeepDiff([], [])

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[]       │ │ []      ',
        ].join('\n')
    )
})


it('Should render the array diff correctly #2', async t => {
    const difference1   = compareDeepDiff([ 1, 1 ], [ 0, 0 ])

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ [       ',
            '  1,     │0│   0,    ',
            '  1      │1│   0     ',
            ']        │ │ ]       '
        ].join('\n')
    )
})


it('Should render the array diff correctly #2.1', async t => {
    const difference1   = compareDeepDiff([ 1, 1 ], [ 0 ])

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ [       ',
            '  1,     │0│   0     ',
            '  1      │1│   ░     ',
            ']        │ │ ]       '
        ].join('\n')
    )

    const difference2   = compareDeepDiff([ 1 ], [ 0, 0 ])

    t.is(
        stripZws(rendererPlain.render(difference2.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ [       ',
            '  1      │0│   0,    ',
            '  ░      │1│   0     ',
            ']        │ │ ]       '
        ].join('\n')
    )
})


it('Should render the array diff correctly #3', async t => {
    const difference2   = compareDeepDiff([ { a : 1 } ], [ 3 ])

    t.is(
        stripZws(rendererPlain.render(difference2.template())),
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
})


it('Should render the array diff correctly #4', async t => {
    const difference3   = compareDeepDiff([ { a : 1 }, { b : 2 } ], [ 3, 4 ])

    t.is(
        stripZws(rendererPlain.render(difference3.template())),
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
})


it('Should render the array diff correctly #5', async t => {
    const difference4   = compareDeepDiff([ { a : 1 }, 3, 4 ], [ { a : 1 }, 2 ])

    t.is(
        stripZws(rendererPlain.render(difference4.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            '[          │ │ [         ',
            '  {        │0│   {       ',
            '    "a": 1 │ │     "a": 1',
            '  },       │ │   },      ',
            '  3,       │1│   2       ',
            '  4        │2│   ░       ',
            ']          │ │ ]         '
        ].join('\n')
    )
})


it('Should render the array diff correctly #6', async t => {
    const difference5   = compareDeepDiff([ 3 ], [ 2, { a : 1 }, { b : 2 } ])

    t.is(
        stripZws(rendererPlain.render(difference5.template())),
        [
            'Received │ │ Expected  ',
            '         │ │           ',
            '[        │ │ [         ',
            '  3      │0│   2,      ',
            '  ░      │1│   {       ',
            '         │ │     "a": 1',
            '         │ │   },      ',
            '  ░      │2│   {       ',
            '         │ │     "b": 2',
            '         │ │   }       ',
            ']        │ │ ]         '
        ].join('\n')
    )
})


it('Should render the array diff correctly #7', async t => {
    const difference5   = compareDeepDiff([ [ 1 ], [ 2, 3 ] ], [ [ 1 ] ])

    t.is(
        stripZws(rendererPlain.render(difference5.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ [       ',
            '  [      │0│   [     ',
            '    1    │0│     1   ',
            '  ],     │ │   ]     ',
            '  [      │1│   ░     ',
            '    2,   │0│         ',
            '    3    │1│         ',
            '  ]      │ │         ',
            ']        │ │ ]       '
        ].join('\n')
    )
})


it('Should render the object diff correctly #1', async t => {
    const difference0   = compareDeepDiff({}, {})

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '{}       │ │ {}      ',
        ].join('\n')
    )
})


it('Should render the object diff correctly #2', async t => {
    const difference1   = compareDeepDiff({ a : 1 }, { a : 2 })

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '{        │ │ {       ',
            '  "a": 1 │ │   "a": 2',
            '}        │ │ }       ',
        ].join('\n')
    )
})


it('Should render the object diff correctly #3', async t => {
    const difference2   = compareDeepDiff({ a : 1 }, { b : 2 })

    t.is(
        stripZws(rendererPlain.render(difference2.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '{        │ │ {       ',
            '  "a": 1 │ │   ░     ',
            '  ░      │ │   "b": 2',
            '}        │ │ }       ',
        ].join('\n')
    )
})


it('Should render the object diff correctly #4', async t => {
    const difference3   = compareDeepDiff({ a : 1, b : 2 }, { a : 1, c : 3 })

    t.is(
        stripZws(rendererPlain.render(difference3.template())),
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
})


it('Should render the object diff correctly #4.1', async t => {
    const difference3   = compareDeepDiff({ a : 1, b : 2 }, { a : 1 })

    t.is(
        stripZws(rendererPlain.render(difference3.template())),
        [
            'Received  │ │ Expected',
            '          │ │         ',
            '{         │ │ {       ',
            '  "a": 1, │ │   "a": 1',
            '  "b": 2  │ │   ░     ',
            '}         │ │ }       ',
        ].join('\n')
    )
})


it('Should render the object diff correctly #5', async t => {
    const difference4   = compareDeepDiff({ a : 1, b : 2, d : 4 }, { a : 1, c : 3, e : 5 })

    t.is(
        stripZws(rendererPlain.render(difference4.template())),
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
})


it('Should render the object diff correctly #6', async t => {
    const difference5   = compareDeepDiff({ a : 1, b : { c : 2, d : 4 } }, { a : 1, b : { c : 3, e : 5 } })

    t.is(
        stripZws(rendererPlain.render(difference5.template())),
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
})


it('Should render the object diff correctly #7', async t => {
    const difference6   = compareDeepDiff({ a : 1, b : [ 2, 3 ], c : [ 6, 7 ] }, { a : 1, b : [ 3, 4, 5 ] })

    t.is(
        stripZws(rendererPlain.render(difference6.template())),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            '{         │ │ {        ',
            '  "a": 1, │ │   "a": 1,',
            '  "b": [  │ │   "b": [ ',
            '    2,    │0│     3,   ',
            '    3     │1│     4,   ',
            '    ░     │2│     5    ',
            '  ],      │ │   ]      ',
            '  "c": [  │ │   ░      ',
            '    6,    │0│          ',
            '    7     │1│          ',
            '  ]       │ │          ',
            '}         │ │ }        ',
        ].join('\n')
    )
})


it('Should render the set diff correctly #1', async t => {
    const difference2   = compareDeepDiff(new Set([]), new Set([]))

    t.is(
        stripZws(rendererPlain.render(difference2.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            'Set (0) {} │ │ Set (0) {}',
        ].join('\n')
    )
})


it('Should render the set diff correctly #2', async t => {
    const difference1   = compareDeepDiff(new Set([ 1, 2 ]), new Set([ 2, 3 ]))

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
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
})


it('Should render the set diff correctly #3', async t => {
    const difference1   = compareDeepDiff(new Set([ { a : 1 }, { b : 2 } ]), new Set([ { a : 1 }, { c : 3 } ]))

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            'Set (2) {  │ │ Set (2) { ',
            '  {        │ │   {       ',
            '    "a": 1 │ │     "a": 1',
            '  },       │ │   },      ',
            '  {        │ │   ░       ',
            '    "b": 2 │ │           ',
            '  }        │ │           ',
            '  ░        │ │   {       ',
            '           │ │     "c": 3',
            '           │ │   }       ',
            '}          │ │ }         ',
        ].join('\n')
    )
})


it('Should render the set diff correctly #4', async t => {
    const difference1   = compareDeepDiff(new Set([ [ 1, 2 ] ]), new Set([ [ 3, 4 ] ]))

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            'Set (1) { │ │ Set (1) {',
            '  [       │ │   ░      ',
            '    1,    │0│          ',
            '    2     │1│          ',
            '  ]       │ │          ',
            '  ░       │ │   [      ',
            '          │0│     3,   ',
            '          │1│     4    ',
            '          │ │   ]      ',
            '}         │ │ }        ',
        ].join('\n')
    )
})


it('Should render the map diff correctly #1', async t => {
    const difference0   = compareDeepDiff(new Map([]), new Map([]))

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            'Map (0) {} │ │ Map (0) {}',
        ].join('\n')
    )
})


it('Should render the map diff correctly #2', async t => {
    const difference1   = compareDeepDiff(new Map([ [ 1, 1 ], [ 2, 2 ] ]), new Map([ [ 2, 2 ], [ 3, 3 ] ]))

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            'Map (2) { │ │ Map (2) {',
            '  2 => 2, │ │   2 => 2,',
            '  1 => 1  │ │   ░      ',
            '  ░       │ │   3 => 3 ',
            '}         │ │ }        ',
        ].join('\n')
    )
})


it('Should render the map diff correctly #2.1', async t => {
    const difference1   = compareDeepDiff(new Map([ [ 1, 1 ], [ 2, 2 ] ]), new Map([ [ 2, 2 ] ]))

    t.is(
        stripZws(rendererPlain.render(difference1.template())),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            'Map (2) { │ │ Map (1) {',
            '  2 => 2, │ │   2 => 2 ',
            '  1 => 1  │ │   ░      ',
            '}         │ │ }        ',
        ].join('\n')
    )
})


it('Should render the map diff correctly #3', async t => {
    const difference2   = compareDeepDiff(new Map([ [ { a : 1 }, 1 ], [ { b : 2 }, 2 ] ]), new Map([ [ { a : 1 }, 2 ], [ { c : 3 }, 3 ] ]))

    t.is(
        stripZws(rendererPlain.render(difference2.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            'Map (2) {  │ │ Map (2) { ',
            '  {        │ │   {       ',
            '    "a": 1 │ │     "a": 1',
            '  } => 1,  │ │   } => 2, ',
            '  {        │ │   ░       ',
            '    "b": 2 │ │           ',
            '  } => 2   │ │           ',
            '  ░        │ │   {       ',
            '           │ │     "c": 3',
            '           │ │   } => 3  ',
            '}          │ │ }         ',
        ].join('\n')
    )
})


it('Should render the map diff correctly #4', async t => {
    const difference3   = compareDeepDiff(
        new Map([ [ { a : 1 }, { b : 2 } ], [ { b : 2 }, { c : 3 } ] ]),
        new Map([ [ { a : 1 }, { b : 3 } ], [ { c : 3 }, { b : 2 } ] ])
    )

    t.is(
        stripZws(rendererPlain.render(difference3.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            'Map (2) {  │ │ Map (2) { ',
            '  {        │ │   {       ',
            '    "a": 1 │ │     "a": 1',
            '  } => {   │ │   } => {  ',
            '    "b": 2 │ │     "b": 3',
            '  },       │ │   },      ',
            '  {        │ │   ░       ',
            '    "b": 2 │ │           ',
            '  } => {   │ │           ',
            '    "c": 3 │ │           ',
            '  }        │ │           ',
            '  ░        │ │   {       ',
            '           │ │     "c": 3',
            '           │ │   } => {  ',
            '           │ │     "b": 2',
            '           │ │   }       ',
            '}          │ │ }         ',
        ].join('\n')
    )
})


it('Should render the map diff correctly #5', async t => {
    class Key {
        constructor (public a : number) {}
    }

    class Mey {
        constructor (public a : number) {}
    }

    const difference4   = compareDeepDiff(
        new Map([ [ new Key(10), { b : 2 } ], [ new Key(11), { c : 3 } ] ]),
        new Map([ [ new Mey(10), { b : 3 } ], [ new Mey(11), { b : 2 } ] ])
    )

    t.is(
        stripZws(rendererPlain.render(difference4.template())),
        [
            'Received    │ │ Expected   ',
            '            │ │            ',
            'Map (2) {   │ │ Map (2) {  ',
            '  Key {     │ │   Mey {    ',
            '    "a": 10 │ │     "a": 10',
            '  } => {    │ │   } => {   ',
            '    "b": 2  │ │     "b": 3 ',
            '  },        │ │   },       ',
            '  Key {     │ │   Mey {    ',
            '    "a": 11 │ │     "a": 11',
            '  } => {    │ │   } => {   ',
            '    "c": 3  │ │     ░      ',
            '    ░       │ │     "b": 2 ',
            '  }         │ │   }        ',
            '}           │ │ }          ',
        ].join('\n')
    )
})


it('Should render the map diff correctly #6', async t => {
    const difference3   = compareDeepDiff(
        new Map([ [ [ 1, 2 ], [ 3, 4 ] ], [ [ 11, 22 ], [ 33, 44 ] ] ]),
        new Map([ [ [ 1, 2 ], [ 3, 4 ] ], [ [ 10, 20 ], [ 30, 40 ] ] ]),
    )

    t.is(
        stripZws(rendererPlain.render(difference3.template())),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            'Map (2) { │ │ Map (2) {',
            '  [       │ │   [      ',
            '    1,    │0│     1,   ',
            '    2     │1│     2    ',
            '  ] => [  │ │   ] => [ ',
            '    3,    │0│     3,   ',
            '    4     │1│     4    ',
            '  ],      │ │   ],     ',
            '  [       │ │   ░      ',
            '    11,   │0│          ',
            '    22    │1│          ',
            '  ] => [  │ │          ',
            '    33,   │0│          ',
            '    44    │1│          ',
            '  ]       │ │          ',
            '  ░       │ │   [      ',
            '          │0│     10,  ',
            '          │1│     20   ',
            '          │ │   ] => [ ',
            '          │0│     30,  ',
            '          │1│     40   ',
            '          │ │   ]      ',
            '}         │ │ }        ',
        ].join('\n')
    )
})


it('Should render the diff of circular data structures correctly #1', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    const difference0   = compareDeepDiff(a1, a2)

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received             │ │ Expected            ',
            '                     │ │                     ',
            '<ref *1> {           │ │ <ref *1> {          ',
            '  "a": [Circular *1] │ │   "a": [Circular *1]',
            '}                    │ │ }                   ',
        ].join('\n')
    )
})


it('Should render the diff of circular data structures correctly #2', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    const difference0   = compareDeepDiff([ a1, a2 ], [ a1, false ])

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received               │ │ Expected              ',
            '                       │ │                       ',
            '[                      │ │ [                     ',
            '  <ref *1> {           │0│   <ref *1> {          ',
            '    "a": [Circular *1] │ │     "a": [Circular *1]',
            '  },                   │ │   },                  ',
            '  <ref *2> {           │1│   false               ',
            '    "a": [Circular *2] │ │                       ',
            '  }                    │ │                       ',
            ']                      │ │ ]                     ',
        ].join('\n')
    )
})


it('Should render the diff of circular data structures correctly #3', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    const a3    = { a : a2 }

    const difference0   = compareDeepDiff(a1, a3)

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received               │ │ Expected              ',
            '                       │ │                       ',
            '<ref *1> {             │ │ {                     ',
            '  "a": <circular *1> { │ │   "a": <ref *1> {     ',
            '    "a": [Circular *1] │ │     "a": [Circular *1]',
            '  }                    │ │   }                   ',
            '}                      │ │ }                     ',
        ].join('\n')
    )
})


it('Should render the diff of circular data structures correctly #4', async t => {
    const a = {
        prop : {
            maxDepth : 4
        }
    }

    const circular = { ref : undefined }
    circular.ref = circular

    const b = {
        prop : circular
    }

    const difference0   = compareDeepDiff(a, b)

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received          │ │ Expected                ',
            '                  │ │                         ',
            '{                 │ │ {                       ',
            '  "prop": {       │ │   "prop": <ref *1> {    ',
            '    "maxDepth": 4 │ │     ░                   ',
            '    ░             │ │     "ref": [Circular *1]',
            '  }               │ │   }                     ',
            '}                 │ │ }                       ',
        ].join('\n')
    )
})


it('Should render the diff of circular data structures correctly #5', async t => {
    const child     = { parent : undefined, children : [] }
    const parent    = { parent : undefined, children : [ child ] }
    child.parent    = parent

    const difference0   = compareDeepDiff(child, parent)

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received                 │ │ Expected                      ',
            '                         │ │                               ',
            '<ref *1> {               │ │ <ref *1> {                    ',
            '  "parent": {            │ │   "parent": undefined,        ',
            '    "parent": undefined, │ │                               ',
            '    "children": [        │ │                               ',
            '      [Circular *1]      │ │                               ',
            '    ]                    │ │                               ',
            '  },                     │ │                               ',
            '  "children": [          │ │   "children": [               ',
            '    ░                    │0│     {                         ',
            '                         │ │       "parent": [Circular *1],',
            '                         │ │       "children": []          ',
            '                         │ │     }                         ',
            '  ]                      │ │   ]                           ',
            '}                        │ │ }                             ',
        ].join('\n')
    )
})


it('Should render the diff of heterogeneous data correctly #1', async t => {
    const difference0   = compareDeepDiff([ { a : { b : 2 } }, [] ], [ [ 1, 2 ], { c : 2 } ])

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received     │ │ Expected  ',
            '             │ │           ',
            '[            │ │ [         ',
            '  {          │0│   [       ',
            '    "a": {   │ │     1,    ',
            '      "b": 2 │ │     2     ',
            '    }        │ │   ],      ',
            '  },         │ │           ',
            '  []         │1│   {       ',
            '             │ │     "c": 2',
            '             │ │   }       ',
            ']            │ │ ]         ',
        ].join('\n')
    )
})


it('Should render the diff of heterogeneous data correctly #2', async t => {
    const difference0   = compareDeepDiff([ { a : { b : 2 } }, new Set([ 1 ]) ], [ 1, { c : 2 } ])

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received     │ │ Expected  ',
            '             │ │           ',
            '[            │ │ [         ',
            '  {          │0│   1,      ',
            '    "a": {   │ │           ',
            '      "b": 2 │ │           ',
            '    }        │ │           ',
            '  },         │ │           ',
            '  Set (1) {  │1│   {       ',
            '    1        │ │     "c": 2',
            '  }          │ │   }       ',
            ']            │ │ ]         ',
        ].join('\n')
    )
})


it('Should render the diff of RegExp correctly #1', async t => {
    const difference0   = compareDeepDiff(/a/, /a/i)

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '/a/      │ │ /a/i    ',
        ].join('\n')
    )
})


it('Should render the diff of Date correctly #1', async t => {
    const difference0   = compareDeepDiff(new Date(2020, 1, 1), new Date(2020, 1, 2))

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received                          │ │ Expected                         ',
            '                                  │ │                                  ',
            'new Date("2020/01/01 00:00:00.0") │ │ new Date("2020/01/02 00:00:00.0")',
        ].join('\n')
    )
})


it('Should render the diff with empty array correctly', async t => {
    const a = {
        "descriptor": {
            "parentNode": undefined
        }
    }

    const b = {
        "descriptor": {
            "tags": [],
            "isTodo": false
        }
    }

    const difference0   = compareDeepDiff(a, b)

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received                    │ │ Expected           ',
            '                            │ │                    ',
            '{                           │ │ {                  ',
            '  "descriptor": {           │ │   "descriptor": {  ',
            '    "parentNode": undefined │ │     ░              ',
            '    ░                       │ │     "tags": [],    ',
            '    ░                       │ │     "isTodo": false',
            '  }                         │ │   }                ',
            '}                           │ │ }                  ',
        ].join('\n')
    )
})


it('Should render the diff with number matcher correctly #1', async t => {
    const difference0   = compareDeepDiff({ a : 10 }, { a : anyNumberApprox(10, { threshold : 1 }) })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received  │ │ Expected   ',
            '          │ │            ',
            '{         │ │ {          ',
            '  "a": 10 │ │   "a": 10±1',
            '}         │ │ }          ',
        ].join('\n')
    )
})


it('Should render the diff with number matcher correctly #2', async t => {
    const difference0   = compareDeepDiff({ a : 10 }, { a : anyNumberApprox(10, { percent : 3 }) })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received  │ │ Expected    ',
            '          │ │             ',
            '{         │ │ {           ',
            '  "a": 10 │ │   "a": 10±3%',
            '}         │ │ }           ',
        ].join('\n')
    )
})


it('Should render the diff with number matcher correctly #3', async t => {
    const difference0   = compareDeepDiff({ a : 10.12 }, { a : anyNumberApprox(10.1234, { digits : 2 }) })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received     │ │ Expected      ',
            '             │ │               ',
            '{            │ │ {             ',
            '  "a": 10.12 │ │   "a": 10.12xx',
            '}            │ │ }             ',
        ].join('\n')
    )
})


it('Should render the diff with string matcher correctly #1', async t => {
    const difference0   = compareDeepDiff({ a : 'foobar' }, { a : anyStringLike(/FOO/i) })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received        │ │ Expected                         ',
            '                │ │                                  ',
            '{               │ │ {                                ',
            '  "a": "foobar" │ │   "a": any string matching /FOO/i',
            '}               │ │ }                                ',
        ].join('\n')
    )
})


it('Should render the diff with string matcher correctly #2', async t => {
    const difference0   = compareDeepDiff({ a : 'foobar' }, { a : anyStringLike('oob') })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received        │ │ Expected                          ',
            '                │ │                                   ',
            '{               │ │ {                                 ',
            '  "a": "foobar" │ │   "a": any string containing "oob"',
            '}               │ │ }                                 ',
        ].join('\n')
    )
})


it('Should render the diff with "anyInstanceOf" matcher correctly #1', async t => {
    const difference0   = compareDeepDiff({ a : 'foobar' }, { a : anyInstanceOf(String) })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received        │ │ Expected           ',
            '                │ │                    ',
            '{               │ │ {                  ',
            '  "a": "foobar" │ │   "a": any [String]',
            '}               │ │ }                  ',
        ].join('\n')
    )
})


it('Should render the diff with "anyInstanceOf" matcher correctly #2', async t => {
    class MyClass {}

    const difference0   = compareDeepDiff({ a : new MyClass() }, { a : any(MyClass) })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received          │ │ Expected            ',
            '                  │ │                     ',
            '{                 │ │ {                   ',
            '  "a": MyClass {} │ │   "a": any [MyClass]',
            '}                 │ │ }                   ',
        ].join('\n')
    )
})


it('Should render the diff with "any" matcher correctly #1', async t => {
    const difference0   = compareDeepDiff({ a : 123 }, { a : any() })

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received   │ │ Expected  ',
            '           │ │           ',
            '{          │ │ {         ',
            '  "a": 123 │ │   "a": any',
            '}          │ │ }         ',
        ].join('\n')
    )
})


it('Should render the diff with "anyObjectContaining" matcher correctly #1', async t => {
    const difference0   = compareDeepDiff({ a : 1, b : 2 }, anyObjectContaining({ a : 1 }))

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received  │ │ Expected',
            '          │ │         ',
            '{         │ │ ~{      ',
            '  "a": 1, │ │   "a": 1',
            '  "b": 2  │ │   ░     ',
            '}         │ │ }       ',
        ].join('\n')
    )
})


it('Should render the diff with "anyObjectContaining" matcher correctly #2', async t => {
    const difference0   = compareDeepDiff({ a : 1 }, anyObjectContaining({ a : 1, b : 2 }))

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received │ │ Expected ',
            '         │ │          ',
            '{        │ │ ~{       ',
            '  "a": 1 │ │   "a": 1,',
            '  ░      │ │   "b": 2 ',
            '}        │ │ }        ',
        ].join('\n')
    )
})


it('Should render the diff with "anyArrayContaining" matcher correctly #1', async t => {
    const difference0   = compareDeepDiff([ 1, 2 ], anyArrayContaining([ 1 ]))

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ ~[      ',
            '  1,     │0│   1     ',
            '  2      │1│   ░     ',
            ']        │ │ ]       '
        ].join('\n')
    )
})


it('Should render the diff with "anyArrayContaining" matcher correctly #2', async t => {
    const difference0   = compareDeepDiff([ 1 ], anyArrayContaining([ 1, 2 ]))

    t.is(
        stripZws(rendererPlain.render(difference0.template())),
        [
            'Received │ │ Expected',
            '         │ │         ',
            '[        │ │ ~[      ',
            '  1      │0│   1,    ',
            '  ░      │ │   2     ',
            ']        │ │ ]       '
        ].join('\n')
    )
})
