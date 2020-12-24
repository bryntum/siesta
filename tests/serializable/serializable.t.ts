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


    t.it('Nested basic serialization should work', async t => {
        class SomeClass1 extends Serializable {
            prop1       : number    = 1
        }

        registerSerializableClass('someclass1', SomeClass1)

        class SomeClass2 extends Serializable {
            prop2       : SomeClass1    = new SomeClass1()
        }

        registerSerializableClass('someclass2', SomeClass2)

        const someClass     = new SomeClass2()

        t.isDeeply(JSON.parse(JSON.stringify(someClass)), { prop2 : { prop1 : 1, $class : 'someclass1' }, $class : 'someclass2' })

        const revived : SomeClass2      = JSON.parse(JSON.stringify(someClass), reviver)

        t.isInstanceOf(revived, SomeClass2)
        t.isInstanceOf(revived.prop2, SomeClass1)

        t.is(revived.prop2.prop1, 1, 'Correct nested value')
    })


    t.it('Serialization of nested array property should work', async t => {
        class SomeClass1 extends Serializable {
            prop1       : number    = 1
        }

        registerSerializableClass('someclass11', SomeClass1)

        class SomeClass2 extends Serializable {
            prop2       : SomeClass1[]      = [ new SomeClass1() ]
        }

        registerSerializableClass('someclass22', SomeClass2)

        const someClass     = new SomeClass2()

        t.isDeeply(JSON.parse(JSON.stringify(someClass)), { prop2 : [ { prop1 : 1, $class : 'someclass11' } ], $class : 'someclass22' })

        const revived : SomeClass2      = JSON.parse(JSON.stringify(someClass), reviver)

        t.isInstanceOf(revived, SomeClass2)
        t.isInstanceOf(revived.prop2, Array)
        t.isInstanceOf(revived.prop2[ 0 ], SomeClass1)

        t.is(revived.prop2[ 0 ].prop1, 1, 'Correct nested value')
        t.is(revived.prop2[ 0 ].prop1, 1, 'Correct nested value')
    })

})


