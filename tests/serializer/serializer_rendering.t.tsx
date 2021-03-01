import { it } from "../../index.js"
import { any, anyInstanceOf, anyNumberApprox, anyNumberBetween } from "../../src/compare_deep/FuzzyMatcher.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRendererSerialization } from "../../src/serializer/SerializerRendering.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer          = XmlRendererSerialization.new()
const rendererPretty    = XmlRendererSerialization.new({ prettyPrint : true })

//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render serialized primitive values', async t => {
    t.is(
        renderer.printValue(undefined),
        "undefined"
    )

    t.is(
        renderer.printValue(null),
        "null"
    )

    t.is(
        renderer.printValue(1),
        "1"
    )

    //-----------------
    t.is(
        renderer.printValue(false),
        "false"
    )

    //-----------------
    t.is(
        renderer.printValue(Symbol(1)),
        "Symbol(1)"
    )

    //-----------------
    t.is(
        renderer.printValue("1"),
        '"1"'
    )

    //-----------------
    t.is(
        renderer.printValue(new Date(2000, 1, 1)),
        'new Date("2000/01/01 00:00:00.0")'
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render serialized arrays of numbers', async t => {
    t.is(renderer.printValue([]), '[]')

    t.is(renderer.printValue([ 1, 2, 3 ]), '[1, 2, 3]')

    t.is(rendererPretty.printValue([ 1, 2, 3 ]),
`[
  1,
  2,
  3
]`
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render objects', async t => {

    t.is(
        renderer.printValue({}),
        `{}`,
        'Empty object stringification'
    )


    //-----------------
    t.is(
        renderer.printValue({ prop1 : { prop2 : 2 }, prop3 : 3 }),
        `{ "prop1": { "prop2": 2 }, "prop3": 3 }`,
        'Non-empty, non-pretty object stringification, w/o content wrapping'
    )


    //-----------------
    t.is(
        rendererPretty.printValue({ prop1 : { prop2 : 2 }, prop3 : 3 }),
`{
  "prop1": {
    "prop2": 2
  },
  "prop3": 3
}`,
        'Non-empty, pretty object stringification, w/o content wrapping'
    )

    //-----------------
    t.is(
        rendererPretty.printValue({ prop1 : { prop2 : '1'.repeat(10) } }, { maxLen : 20 }),
`{
  "prop1": {
    "prop2": "111111
      1111"
  }
}`,
        'Object stringification with indent'
    )
})

//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render array of objects', async t => {

    t.is(
        rendererPretty.printValue([ { prop : 1 }, { prop : 2 }, { prop : 3 } ]),
`[
  {
    "prop": 1
  },
  {
    "prop": 2
  },
  {
    "prop": 3
  }
]`,
        'Array of objects stringification'
    )
})

//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render object of arrays', async t => {

    t.is(
        rendererPretty.printValue({ prop1 : [ 1, 2 ], prop2 : [ 2, 3 ] }),
`{
  "prop1": [
    1,
    2
  ],
  "prop2": [
    2,
    3
  ]
}`,
        'Object of arrays stringification'
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render sets', async t => {

    t.is(
        rendererPretty.printValue(new Set([])),
        `Set (0) {}`,
        'Set stringification'
    )

    t.is(
        rendererPretty.printValue(new Set([ 1, 2, 3 ])),
`Set (3) {
  1,
  2,
  3
}`,
        'Set pretty-print stringification'
    )

    t.is(
        renderer.printValue(new Set([ 1, 2, 3 ])),
        `Set (3) { 1, 2, 3 }`,
        'Set regular stringification'
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render maps', async t => {

    t.is(
        renderer.printValue(new Map([ [ 1, '1' ], [ 2, '2' ], [ 3, '3' ] ])),
        `Map (3) { 1 => "1", 2 => "2", 3 => "3" }`,
        'Map regular stringification'
    )

    t.is(
        rendererPretty.printValue(new Map([ [ 1, '1' ], [ 2, '2' ], [ 3, '3' ] ])),
`Map (3) {
  1 => "1",
  2 => "2",
  3 => "3"
}`,
        'Map pretty-print stringification'
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should show "out of wide" symbol', async t => {
    //-----------------
    t.is(
        rendererPretty.printValue({ prop1 : 1, prop2 : 2, prop3 : 3 }, undefined, { maxBreadth : 2 }),
`{
  "prop1": 1,
  "prop2": 2,
  ... (1 more)
}`,
        'Stringification of object with "out of wide" entries'
    )

    //-----------------
    t.is(
        rendererPretty.printValue([ 1, 2, 3 ], undefined, { maxBreadth : 2 }),
`[
  1,
  2,
  ... (1 more)
]`,
        'Stringification of array with "out of wide" elements'
    )

    //-----------------
    t.is(
        rendererPretty.printValue(new Set([ 1, 2, 3 ]), undefined, { maxBreadth : 2 }),
`Set (3) {
  1,
  2,
  ...
}`,
        'Stringification of set with "out of wide" elements'
    )

    //-----------------
    t.is(
        rendererPretty.printValue(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), undefined, { maxBreadth : 2 }),
`Map (3) {
  1 => 1,
  2 => 2,
  ...
}`,
        'Stringification of map with "out of wide" entries'
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should show "out of depth" symbol', async t => {

    t.is(
        rendererPretty.printValue({ prop1 : 1, prop2 : { prop3 : 3 } }, undefined, { maxDepth : 1 }),
`{
  "prop1": 1,
  "prop2": ▼ Object { ... }
}`,
        'Stringification of object with "out of depth" entry value'
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should include reference number into serialization', async t => {
    //-----------------
    const a     = { a : undefined }
    a.a         = a

    t.is(renderer.printValue(a), '<ref *1> { "a": [Circular *1] }')

    //-----------------
    const b     = { b : undefined, c : undefined }
    b.b         = b
    b.c         = b

    t.is(renderer.printValue(b), '<ref *1> { "b": [Circular *1], "c": [Circular *1] }')

    //-----------------
    const map   = new Map()
    map.set(map, map)

    t.is(renderer.printValue(map), '<ref *1> Map (1) { [Circular *1] => [Circular *1] }')
})


//---------------------------------------------------------------------------------------------------------------------
it('Should include class name into serialization', async t => {

    class SomeClass {
        a : number          = 1
    }

    t.is(renderer.printValue(new SomeClass()), 'SomeClass { "a": 1 }')
})


//---------------------------------------------------------------------------------------------------------------------
it('Should serialize number placeholder', async t => {
    t.is(renderer.printValue(anyNumberApprox(10)), '10±0.5')
    t.is(renderer.printValue(anyNumberBetween(1, 2)), '1 ≤ x ≤ 2')
})


//---------------------------------------------------------------------------------------------------------------------
it('Should serialize instance placeholder', async t => {
    t.is(renderer.printValue(anyInstanceOf(Date)), 'any [Date]')
    t.is(renderer.printValue(anyInstanceOf(Number)), 'any [Number]')
})


//---------------------------------------------------------------------------------------------------------------------
it('Should serialize any placeholder', async t => {
    t.is(renderer.printValue(any()), 'any')
})
