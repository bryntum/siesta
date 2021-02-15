import { it } from "../../../main.js"
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
it('`equal` assertion should work', async t => {

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
