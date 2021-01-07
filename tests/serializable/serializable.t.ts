import {
    Collapser,
    Expander,
    parse,
    reviver,
    serializable,
    Serializable,
    setReferenceIdSource,
    stringify
} from "../../src/serializable/Serializable.js"

declare const StartTest : any

StartTest(t => {

    t.it('Should be able to collapse cyclic structures', async t => {
        const a             = { a : undefined }
        a.a                 = a

        setReferenceIdSource(0)

        t.isDeeply(
            Collapser.new().collapse(a),
            {
                $refId  : 0,
                value   : { a : { $ref : 0 } }
            }
        )

        setReferenceIdSource(0)

        const b             = []
        b.push(b)

        t.isDeeply(
            Collapser.new().collapse(b),
            {
                $refId  : 0,
                value   : [ { $ref : 0 } ]
            }
        )
    })


    t.it('Should be able to collapse cyclic structures', async t => {
        const a             = { a : undefined }
        a.a                 = a

        const revived : typeof a    = Expander.new().expand(Collapser.new().collapse(a)) as any

        t.isNot(revived, a)

        t.is(revived.a, revived)
    })


    t.it('Basic serialization should work', async t => {
        @serializable('someclass')
        class SomeClass extends Serializable {
            prop1       : number    = 1
            prop2       : string    = '2'
        }

        const someClass     = new SomeClass()

        t.isDeeply(parse(stringify(someClass)), { prop1 : 1, prop2 : '2' })

        const revived       = parse(stringify(someClass))

        t.isInstanceOf(revived, SomeClass)
    })


    t.it('Nested basic serialization should work', async t => {
        @serializable('someclass1')
        class SomeClass1 extends Serializable {
            prop1       : number    = 1
        }

        @serializable('someclass2')
        class SomeClass2 extends Serializable {
            prop2       : SomeClass1    = new SomeClass1()
        }

        const someClass2    = new SomeClass2()

        t.isDeeply(parse(stringify(someClass2)), { prop2 : { prop1 : 1 } })

        const revived : SomeClass2      = parse(stringify(someClass2))

        t.isInstanceOf(revived, SomeClass2)
        t.isInstanceOf(revived.prop2, SomeClass1)

        t.is(revived.prop2.prop1, 1, 'Correct nested value')
    })


    t.it('Serialization of nested array property should work', async t => {
        @serializable('someclass11')
        class SomeClass1 extends Serializable {
            prop1       : number    = 1
        }

        @serializable('someclass22')
        class SomeClass2 extends Serializable {
            prop2       : SomeClass1[]      = [ new SomeClass1() ]
        }

        const someClass     = new SomeClass2()

        t.isDeeply(parse(stringify(someClass)), { prop2 : [ { prop1 : 1 } ] })

        const revived : SomeClass2      = parse(stringify(someClass))

        t.isInstanceOf(revived, SomeClass2)
        t.isInstanceOf(revived.prop2, Array)
        t.isInstanceOf(revived.prop2[ 0 ], SomeClass1)

        t.is(revived.prop2[ 0 ].prop1, 1, 'Correct nested value')
        t.is(revived.prop2[ 0 ].prop1, 1, 'Correct nested value')
    })


    t.it('Serialization of cyclic data structures should work', async t => {
        @serializable('someclass111')
        class SomeClass1 extends Serializable {
            another         : SomeClass2    = undefined
        }

        @serializable('someclass222')
        class SomeClass2 extends Serializable {
            another         : SomeClass1    = undefined
        }

        const someClass1    = new SomeClass1()
        const someClass2    = new SomeClass2()

        someClass1.another  = someClass2
        someClass2.another  = someClass1

        const revived : SomeClass1      = parse(stringify(someClass1))

        t.isInstanceOf(revived, SomeClass1)
        t.isInstanceOf(revived.another, SomeClass2)

        t.is(revived.another.another, revived)
        t.is(revived.another.another, revived)
    })

})


