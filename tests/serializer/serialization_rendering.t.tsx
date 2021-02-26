import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRendererSerialization } from "../../src/serializer/SerializerElements.js"
import { StringifierXml } from "../../src/serializer/StringifierXml.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer          = XmlRendererSerialization.new()
const rendererPretty    = XmlRendererSerialization.new({ prettyPrint : true })

//---------------------------------------------------------------------------------------------------------------------
it('Should be able to render serialized numbers', async t => {
    t.is(
        renderer.printValue(1),
        "1"
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
const stringifierConfig : Partial<StringifierXml>  = { prettyPrint : true, maxLen : 20, indentLevel : 2 }

it('Should be able to stringify previously serialized value', async t => {
    //-----------------
    // t.is(
    //     StringifierXml.print(false, stringifierConfig),
    //     "false"
    // )
    //
    //
    // //-----------------
    // t.is(
    //     StringifierXml.print(Symbol(1), stringifierConfig),
    //     "Symbol(1)"
    // )


    // //-----------------
    // t.is(
    //     StringifierXml.print("1", stringifierConfig),
    //     '"1"'
    // )


//
//     //-----------------
//     t.is(
//         StringifierXml.print([ { prop : 1 }, { prop : 2 }, { prop : 3 } ], stringifierConfig),
// `[
//   {
//     "prop": 1
//   },
//   {
//     "prop": 2
//   },
//   {
//     "prop": 3
//   }
// ]`,
//         'Array of objects stringification'
//     )


//     //-----------------
//     t.is(
//         StringifierXml.print(new Set([ 1, 2, 3 ]), stringifierConfig),
// `Set (3) {
//   1,
//   2,
//   3
// }`,
//         'Set stringification'
//     )
//
//
//     //-----------------
//     t.is(
//         StringifierXml.print(new Map([ [ 1, '1' ], [ 2, '2' ], [ 3, '3' ] ]), stringifierConfig),
// `Map (3) {
//   1 => "1",
//   2 => "2",
//   3 => "3"
// }`,
//         'Map stringification'
//     )
})


// //---------------------------------------------------------------------------------------------------------------------
// it('Should show "out of wide" symbol', async t => {
//     //-----------------
//     t.is(
//         StringifierXml.print({ prop1 : 1, prop2 : 2, prop3 : 3 }, stringifierConfig, { maxWide : 2 }),
// `{
//   "prop1": 1,
//   "prop2": 2,
//   ... (1 more)
// }`,
//         'Stringification of object with "out of wide" entries'
//     )
//
//     //-----------------
//     t.is(
//         StringifierXml.print([ 1, 2, 3 ], stringifierConfig, { maxWide : 2 }),
// `[
//   1,
//   2,
//   ... (1 more)
// ]`,
//         'Stringification of array with "out of wide" elements'
//     )
//
//     //-----------------
//     t.is(
//         StringifierXml.print(new Set([ 1, 2, 3 ]), stringifierConfig, { maxWide : 2 }),
// `Set (3) {
//   1,
//   2,
//   ...
// }`,
//         'Stringification of set with "out of wide" elements'
//     )
//
//     //-----------------
//     t.is(
//         StringifierXml.print(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), stringifierConfig, { maxWide : 2 }),
// `Map (3) {
//   1 => 1,
//   2 => 2,
//   ...
// }`,
//         'Stringification of map with "out of wide" entries'
//     )
// })
//
//
// //---------------------------------------------------------------------------------------------------------------------
// it('Should show "out of depth" symbol', async t => {
//     //-----------------
//     t.is(
//         StringifierXml.print({ prop1 : 1, prop2 : { prop3 : 3 } }, { prettyPrint : true, maxLen : 50, indentLevel : 2 }, { maxDepth : 1 }),
// `{
//   "prop1": 1,
//   "prop2": ▼ Object { ... }
// }`,
//         'Stringification of object with "out of depth" entry value'
//     )
// })
//
//
// //---------------------------------------------------------------------------------------------------------------------
// it('Should include reference number into serialization', async t => {
//     //-----------------
//     const a     = { a : undefined }
//     a.a         = a
//
//     t.is(StringifierXml.print(a), '<ref *1> { "a": [Circular *1] }')
//
//     //-----------------
//     const b     = { b : undefined, c : undefined }
//     b.b         = b
//     b.c         = b
//
//     t.is(StringifierXml.print(b), '<ref *1> { "b": [Circular *1], "c": [Circular *1] }')
//
//     //-----------------
//     const map   = new Map()
//     map.set(map, map)
//
//     t.is(StringifierXml.print(map), '<ref *1> Map (1) { [Circular *1] => [Circular *1] }')
// })
//
//
// //---------------------------------------------------------------------------------------------------------------------
// it('Should include class name into serialization', async t => {
//
//     class SomeClass {
//         a : number          = 1
//     }
//
//     t.is(StringifierXml.print(new SomeClass()), 'SomeClass { "a": 1 }')
// })
//
//
// //---------------------------------------------------------------------------------------------------------------------
// it('Should serialize number placeholder', async t => {
//     t.is(StringifierXml.print(anyNumberApprox(10)), '10±0.5')
//     t.is(StringifierXml.print(anyNumberBetween(1, 2)), '1 ≤ x ≤ 2')
// })
//
//
// //---------------------------------------------------------------------------------------------------------------------
// it('Should serialize instance placeholder', async t => {
//     t.is(StringifierXml.print(anyInstanceOf(Date)), 'any [Date]')
//     t.is(StringifierXml.print(anyInstanceOf(Number)), 'any [Number]')
// })
//
//
// //---------------------------------------------------------------------------------------------------------------------
// it('Should serialize any placeholder', async t => {
//     t.is(StringifierXml.print(any()), 'any')
// })
