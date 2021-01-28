import { it } from "../../main.js"
import { SiestaJSX } from "../../src/jsx/Factory.js"
import { Serializer } from "../../src/serializer/Serializer.js"
import { SerializerXml } from "../../src/serializer/SerializerXml.js"
import { StringifierXml } from "../../src/serializer/StringifierXml.js"

//---------------------------------------------------------------------------------------------------------------------
const stringifierConfig : Partial<StringifierXml>  = { prettyPrint : true, maxLen : 20, indentLevel : 2 }

it('Should be able to stringify previously serialized value', async t => {
    const serializedNumber      = SerializerXml.serialize(1)

    t.is(
        StringifierXml.stringify(serializedNumber, stringifierConfig),
        "1"
    )

    //-----------------
    const serializedString      = SerializerXml.serialize("1")

    t.is(
        StringifierXml.stringify(serializedString, stringifierConfig),
        '"1"'
    )


    //-----------------
    const serializedObject1      = SerializerXml.serialize({})

    t.is(
        StringifierXml.stringify(serializedObject1, stringifierConfig),
        `{}`,
        'Empty object stringification'
    )


    //-----------------
    const serializedObject2      = SerializerXml.serialize({ prop1 : { prop2 : 2 }, prop3 : 3 })

    t.is(
        StringifierXml.stringify(serializedObject2, stringifierConfig),
`{
  "prop1": {
    "prop2": 2
  },
  "prop3": 3
}`,
        'Non-empty object stringification, w/o content wrapping'
    )

    //-----------------
    const serializedObject3      = SerializerXml.serialize({ prop1 : { prop2 : '1'.repeat(10) } })

    t.is(
        StringifierXml.stringify(serializedObject3, stringifierConfig),
`{
  "prop1": {
    "prop2": "111111
      1111"
  }
}`,
        'Object stringification with indent'
    )

    //-----------------
    const serializedArray1      = SerializerXml.serialize([ 1, 2, 3 ])

    t.is(
        StringifierXml.stringify(serializedArray1, stringifierConfig),
`[
  1,
  2,
  3
]`,
        'Array stringification'
    )


    //-----------------
    const serializedArray2      = SerializerXml.serialize([ { prop : 1 }, { prop : 2 }, { prop : 3 } ])

    t.is(
        StringifierXml.stringify(serializedArray2, stringifierConfig),
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
        'Array stringification #2'
    )


    //-----------------
    const serializedSet1      = SerializerXml.serialize(new Set([ 1, 2, 3 ]))

    t.is(
        StringifierXml.stringify(serializedSet1, stringifierConfig),
`Set (3) {
  1,
  2,
  3
}`,
        'Set stringification'
    )


    //-----------------
    const serializedMap1      = SerializerXml.serialize(new Map([ [ 1, '1' ], [ 2, '2' ], [ 3, '3' ] ]))

    t.is(
        StringifierXml.stringify(serializedMap1, stringifierConfig),
`Map (3) {
  1 => "1",
  2 => "2",
  3 => "3"
}`,
        'Map stringification'
    )
})


it('Should show "out of wide" symbol', async t => {
    //-----------------
    const serializedObject  = SerializerXml.serialize({ prop1 : 1, prop2 : 2, prop3 : 3 }, { maxWide : 2 })

    t.is(
        StringifierXml.stringify(serializedObject, stringifierConfig),
`{
  "prop1": 1,
  "prop2": 2,
  ... (1 more)
}`,
        'Stringification of object with "out of wide" entries'
    )

    //-----------------
    const serializedArray   = SerializerXml.serialize([ 1, 2, 3 ], { maxWide : 2 })

    t.is(
        StringifierXml.stringify(serializedArray, stringifierConfig),
`[
  1,
  2,
  ... (1 more)
]`,
        'Stringification of array with "out of wide" elements'
    )

    //-----------------
    const serializedSet     = SerializerXml.serialize(new Set([ 1, 2, 3 ]), { maxWide : 2 })

    t.is(
        StringifierXml.stringify(serializedSet, stringifierConfig),
`Set (3) {
  1,
  2,
  ...
}`,
        'Stringification of set with "out of wide" elements'
    )

    //-----------------
    const serializedMap     = SerializerXml.serialize(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), { maxWide : 2 })

    t.is(
        StringifierXml.stringify(serializedMap, stringifierConfig),
`Map (3) {
  1 => 1,
  2 => 2,
  ...
}`,
        'Stringification of map with "out of wide" entries'
    )
})


it('Should show "out of depth" symbol', async t => {
    //-----------------
    const serializedObject  = SerializerXml.serialize({ prop1 : 1, prop2 : { prop3 : 3 } }, { maxDepth : 1 })

    t.is(
        StringifierXml.stringify(serializedObject, { prettyPrint : true, maxLen : 50, indentLevel : 2 }),
`{
  "prop1": 1,
  "prop2": 🠗 Object { ... }
}`,
        'Stringification of object with "out of depth" entry value'
    )
})


it('Should include reference number into serialization', async t => {
    //-----------------
    const a     = { a : undefined }
    a.a         = a

    t.is(StringifierXml.stringify(SerializerXml.serialize(a)), '<ref *1> { "a": [Circular *1] }')

    //-----------------
    const b     = { b : undefined, c : undefined }
    b.b         = b
    b.c         = b

    t.is(StringifierXml.stringify(SerializerXml.serialize(b)), '<ref *1> { "b": [Circular *1], "c": [Circular *1] }')

    //-----------------
    const map   = new Map()
    map.set(map, map)

    t.is(StringifierXml.stringify(SerializerXml.serialize(map)), '<ref *1> Map (1) { [Circular *1] => [Circular *1] }')
})
