import { it } from "../../../index.js"
import { verifyAllFailed } from "../helpers.js"

//-------------------------------------------------------
it('`true` assertion should work', async t => {

    //------------------
    t.true(true)

    t.true(1)

    t.true('true')

    t.true({})

    //------------------
    t.todo('Should all fail', async t => {

        t.true(false)

        t.true(0)

        t.true('')

        t.true(null)

        t.true(undefined)

        t.true(NaN)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`false` assertion should work', async t => {

    //------------------
    t.false(false)

    t.false(0)

    t.false('')

    t.false(null)

    t.false(undefined)

    t.false(NaN)

    //------------------
    t.todo('Should all fail', async t => {

        t.false(true)

        t.false(1)

        t.false('true')

        t.false({})

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`equal/notEqual` assertion should work', async t => {

    //------------------
    t.equal(1, 1)

    t.equal({}, {})

    t.equal([ 1, 2, 3 ], [ 1, 2, 3 ])

    t.equal('string', 'string')

    t.equal(null, null)

    t.equal(undefined, undefined)

    t.equal(NaN, NaN)

    //------------------
    t.notEqual(1, 2)

    t.notEqual({}, { a : 1 })

    t.notEqual([ 1, 2, 3 ], [ 1, 2 ])

    t.notEqual('string', 'STRING')

    t.notEqual(null, undefined)

    t.notEqual(undefined, null)

    t.notEqual(NaN, 10)


    //------------------
    t.todo('Should all fail', async t => {

        t.equal(1, 2)

        t.equal({}, { a : 1 })

        t.equal([ 1, 2, 3 ], [ 1, 2 ])

        t.equal('string', 'STRING')

        t.equal(null, undefined)

        t.equal(undefined, null)

        t.equal(NaN, 10)

        //------------------
        t.notEqual(1, 1)

        t.notEqual({}, {})

        t.notEqual([ 1, 2, 3 ], [ 1, 2, 3 ])

        t.notEqual('string', 'string')

        t.notEqual(null, null)

        t.notEqual(undefined, undefined)

        t.notEqual(NaN, NaN)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`match/notMatch` assertion should work', async t => {

    //------------------
    t.match('zooka', /zOOka/i)

    t.match('zooka', 'oo')

    //------------------
    t.notMatch('zooka', /kuka/)

    t.notMatch('zooka', 'kuka')


    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.notMatch('zooka', /zOOka/i)

        t.notMatch('zooka', 'oo')

        //------------------
        t.match('zooka', /kuka/)

        t.match('zooka', 'kuka')

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`is/isNot` assertion should work', async t => {

    //------------------
    t.is(1, 1)

    t.is('string', 'string')

    t.is(null, null)

    t.is(undefined, undefined)

    t.is(NaN, NaN)

    const date1     = new Date("2020-1-1")
    const date2     = new Date("2020-1-1")

    t.is(date1, date2)

    //------------------
    t.isNot(1, 2)

    t.isNot({}, {})

    t.isNot([ 1, 2, 3 ], [ 1, 2, 3 ])

    t.isNot('string', 'STRING')

    t.isNot(null, undefined)

    t.isNot(undefined, null)

    t.isNot(NaN, 10)

    const date11    = new Date("2020-1-1")
    const date22    = new Date("2020-1-2")

    t.isNot(date11, date22)


    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.isNot(1, 1)

        t.isNot('string', 'string')

        t.isNot(null, null)

        t.isNot(undefined, undefined)

        t.isNot(NaN, NaN)

        const date1     = new Date("2020-1-1")
        const date2     = new Date("2020-1-1")

        t.isNot(date1, date2)

        //------------------
        t.is(1, 2)

        t.is({}, {})

        t.is([ 1, 2, 3 ], [ 1, 2, 3 ])

        t.is('string', 'STRING')

        t.is(null, undefined)

        t.is(undefined, null)

        t.is(NaN, 10)

        const date11    = new Date("2020-1-1")
        const date22    = new Date("2020-1-2")

        t.is(date11, date22)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`isGreater/isLess` assertion should work', async t => {

    //------------------
    t.isGreater(2, 1)

    t.isGreater('b', 'a')

    t.isGreater(true, false)

    const date1     = new Date("2020-1-2")
    const date2     = new Date("2020-1-1")

    t.isGreater(date1, date2)

    //------------------
    t.isGreaterOrEqual(2, 2)

    t.isGreaterOrEqual('b', 'b')

    t.isGreaterOrEqual(true, true)

    t.isGreaterOrEqual(date1, date1)


    //------------------
    t.isLess(1, 2)

    t.isLess('a', 'b')

    t.isLess(false, true)

    t.isLess(date2, date1)

    //------------------
    t.isLessOrEqual(2, 2)

    t.isLessOrEqual('b', 'b')

    t.isLessOrEqual(true, true)

    t.isLessOrEqual(date1, date1)


    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.isLess(2, 1)

        t.isLess('b', 'a')

        t.isLess(true, false)

        const date11     = new Date("2020-1-2")
        const date22     = new Date("2020-1-1")

        t.isLess(date11, date22)

        //------------------
        t.isLessOrEqual(2, 1)

        t.isLessOrEqual('b', 'a')

        t.isLessOrEqual(true, false)

        t.isLessOrEqual(date11, date22)


        //------------------
        t.isGreater(1, 2)

        t.isGreater('a', 'b')

        t.isGreater(false, true)

        t.isGreater(date22, date11)

        //------------------
        t.isGreaterOrEqual(1, 2)

        t.isGreaterOrEqual('a', 'b')

        t.isGreaterOrEqual(false, true)

        t.isGreaterOrEqual(date22, date11)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`isApprox` assertion should work', async t => {

    //------------------
    t.isApprox(1, 1)

    t.isApprox(1.05, 1)

    t.isApprox(1.05, 1, 0.7)

    t.isApprox(1.051, 1.05, { digits : 2 })

    t.isApprox(1, 1.02, { percent : 2 })

    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.isApprox(1, 1.06)

        t.isApprox(1.71, 1, 0.7)

        t.isApprox(1.061, 1.05, { digits : 2 })

        t.isApprox(1, 1.03, { percent : 2 })

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})
