import { it } from "../../main.js"
import { Serializer } from "../../src/util/Serializer.js"

it('Serialization should work', async t => {
    t.is(Serializer.serialize("2"), '"2"')

    t.is(Serializer.serialize({ prop1 : [ Symbol('a'), /a/m ] }), '{ "prop1": [Symbol(a), /a/m] }')
})


it('Should not show "out of wide" properties', async t => {
    t.is(Serializer.serialize({ prop1 : 1, prop2 : 2, prop3 : 3 }, { maxDepth : 1, maxWide : 2 }), '{ "prop1": 1, "prop2": 2, ... }')

    t.is(Serializer.serialize([ 1, 2, 3 ], { maxDepth : 1, maxWide : 2 }), '[1, 2, ...]')

    t.is(Serializer.serialize(new Set([ 1, 2, 3 ]), { maxDepth : 1, maxWide : 2 }), 'Set(3) { 1, 2, ... }')

    t.is(Serializer.serialize(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), { maxDepth : 1, maxWide : 2 }), 'Map(3) { 1 => 1, 2 => 2, ... }')
})


it('Should include class name into serialization', async t => {

    class SomeClass {
        a : number          = 1
    }

    t.is(Serializer.serialize(new SomeClass()), 'SomeClass { "a": 1 }')
})


it('Should include reference number into serialization', async t => {
    const a     = { a : undefined }
    a.a         = a

    t.is(Serializer.serialize(a), '<ref *1> { "a": [Circular *1] }')


    const b     = { b : undefined, c : undefined }
    b.b         = b
    b.c         = b

    t.is(Serializer.serialize(b), '<ref *1> { "b": [Circular *1], "c": [Circular *1] }')
})
