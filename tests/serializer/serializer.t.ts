import { Serializer } from "../../src/util/Serializer.js"

declare const StartTest : any

StartTest(t => {

    t.it('Serialization should work', async t => {
        t.is(Serializer.serialize("2"), '"2"')

        t.is(Serializer.serialize({ prop1 : [ Symbol('a'), /a/m ] }), '{ "prop1": [Symbol(a), /a/m] }')
    })


    t.it('Should include class name into serialization', async t => {

        class SomeClass {
            a : number          = 1
        }

        console.log(Serializer.serialize(window, 1, 4))

        t.is(Serializer.serialize(new SomeClass()), 'SomeClass { "a": 1 }')
    })


    t.it('Should include reference number into serialization', async t => {
        const a     = { a : undefined }
        a.a         = a

        t.is(Serializer.serialize(a), '<ref *1> { "a": [Circular *1] }')


        const b     = { b : undefined, c : undefined }
        b.b         = b
        b.c         = b

        t.is(Serializer.serialize(b), '<ref *1> { "b": [Circular *1], "c": [Circular *1] }')
    })
})


