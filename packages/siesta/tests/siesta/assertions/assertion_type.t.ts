import { it } from "../../../index.js"
import { verifyAllFailed } from "../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`isBoolean/isNumber/...` assertion should work', async t => {

    //------------------
    t.isBoolean(true)
    t.isBoolean(false)

    t.isNumber(1)
    t.isNumber(10)

    t.isString('1')

    t.isDate(new Date())

    t.isArray([])

    t.isMap(new Map())

    t.isSet(new Set())

    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.isBoolean(1)
        t.isBoolean('string')

        t.isNumber({})
        t.isNumber(false)

        t.isString(0)

        t.isDate(11)

        t.isArray({})

        t.isMap(new Set())

        t.isSet(new Map())

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`isInstanceOf` assertion should work', async t => {

    class SomeClass1 {}
    class SomeClass2 extends SomeClass1 {}
    class SomeClass3 {}

    const a1    = new SomeClass1()
    const a2    = new SomeClass2()

    //------------------
    t.isInstanceOf(a1, SomeClass1)

    t.isInstanceOf(a2, SomeClass2)
    t.isInstanceOf(a2, SomeClass1)

    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.isInstanceOf(11, SomeClass1)

        t.isInstanceOf(a1, SomeClass3)
        t.isInstanceOf(a2, SomeClass3)
    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})

