import { it } from "../../index.js"
import { Base } from "../../src/class/Base.js"
import { ClassUnion, Mixin } from "../../src/class/Mixin.js"
import { Collapser, Expander, parse, serializable, Serializable, setReferenceIdSource, stringify } from "../../src/serializable/Serializable.js"

it('Should be able to collapse cyclic structures', async t => {
    const a             = { a : undefined }
    a.a                 = a

    //---------------------
    setReferenceIdSource(0)

    t.isDeeply(
        Collapser.new().collapse(a),
        {
            $refId  : 0,
            value   : { a : { $ref : 0 } }
        }
    )

    //---------------------
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


it('Collapse/expand on cyclic structure should re-create it', async t => {
    const a             = { a : undefined }
    a.a                 = a

    const revived : typeof a    = Expander.new().expand(Collapser.new().collapse(a)) as any

    t.isNot(revived, a)

    t.is(revived.a, revived)
})


it('Should throw exception if `@serializable` class does not include Serializable mixin', async t => {
    t.throws(() => {
        @serializable()
        class SomeClass {
            prop1       : number    = 1
            prop2       : string    = '2'
        }
    }, 'Serializable')


    t.throws(() => {
        @serializable()
        class SomeClass2 extends Mixin(
            [ Base ],
            (base : ClassUnion<typeof Base>) => class SomeClass2 extends base {}
        ) {}
    }, 'Serializable')


    t.doesNotThrow(() => {
        @serializable()
        class SomeClass3 extends Mixin(
            [ Serializable, Base ],
            (base : ClassUnion<typeof Serializable, typeof Base>) => class SomeClass3 extends base {}
        ) {}
    })
})


it('Basic serialization should work', async t => {
    @serializable({ id : 'someclass' })
    class SomeClass extends Serializable {
        prop1       : number    = 1
        prop2       : string    = '2'
    }

    const someClass     = new SomeClass()

    t.isDeeply(parse(stringify(someClass)), { prop1 : 1, prop2 : '2' })

    const revived       = parse(stringify(someClass))

    t.isInstanceOf(revived, SomeClass)
})


it('Nested basic serialization should work', async t => {
    @serializable({ id : 'someclass1' })
    class SomeClass1 extends Serializable {
        prop1       : number    = 1
    }

    @serializable({ id : 'someclass2' })
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


it('Serialization of nested array property should work', async t => {
    @serializable({ id : 'someclass11' })
    class SomeClass1 extends Serializable {
        prop1       : number    = 1
    }

    @serializable({ id : 'someclass22' })
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
})


it('Serialization of cyclic data structures should work', async t => {
    @serializable({ id : 'someclass111' })
    class SomeClass1 extends Serializable {
        another         : SomeClass2    = undefined
    }

    @serializable({ id : 'someclass222' })
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
})


it('Serialization of native data structures should work - Date', async t => {
    const date  = new Date(2020, 1, 1)

    const revived : Date   = parse(stringify(date))

    t.isInstanceOf(revived, Date)

    t.is(revived, date)

    t.isDeeply(revived, date)
})


it('Serialization of crazy cyclic data structures should work - Map', async t => {
    const crazyMap  = new Map()

    crazyMap.set(crazyMap, crazyMap)

    const revived : Map<Map<unknown, unknown>, Map<unknown, unknown>>   = parse(stringify(crazyMap))

    t.isInstanceOf(revived, Map)

    t.is(revived.get(revived), revived)

    t.isDeeply(revived, crazyMap)
})


it('Serialization of crazy cyclic data structures should work - Set', async t => {
    const crazySet  = new Set()

    crazySet.add(crazySet)

    const revived : Set<unknown>   = parse(stringify(crazySet))

    t.isInstanceOf(revived, Set)

    t.is(revived.has(revived), true)

    t.isDeeply(revived, crazySet)
})
