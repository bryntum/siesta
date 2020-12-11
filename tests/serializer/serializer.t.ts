import { Serializer } from "../../src/util/Serializer.js"

declare const StartTest : any

StartTest(t => {

    t.it('Serialization should work', async t => {
        t.is(Serializer.serialize("2"), '"2"')

        t.is(Serializer.serialize({ prop1 : [ Symbol('a'), /a/m ] }), '{"prop1": [Symbol(a), /a/m]}')
    })
})


