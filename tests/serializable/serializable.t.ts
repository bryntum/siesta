import { registerSerializableClass, reviver, Serializable } from "../../src/serializable/Serializable.js"

declare const StartTest : any

StartTest(t => {

    t.it('Basic serialization should work', async t => {
        class SomeClass extends Serializable {
            prop1       : number    = 1
            prop2       : string    = '2'
        }

        registerSerializableClass('someclass', SomeClass)

        const someClass     = new SomeClass()

        t.isDeeply(JSON.parse(JSON.stringify(someClass)), { prop1 : 1, prop2 : '2', $class : 'someclass' })

        const revived       = JSON.parse(JSON.stringify(someClass), reviver)

        t.isInstanceOf(revived, SomeClass)

    })

})


