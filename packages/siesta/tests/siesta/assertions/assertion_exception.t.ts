import { it } from "../../../index.js"
import { delay } from "../../../src/util/TimeHelpers.js"
import { verifyAllFailed } from "../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`throws` assertion should work', async t => {

    //------------------
    t.throws(() => { throw new Error('oopsie') })

    t.throws(() => { throw new Error('oopsie') }, 'oop')

    t.throws(() => { throw new Error('oopsie') }, /OOP/i)


    //------------------
    await t.throws(async () => { await delay(1); throw new Error('oopsie') })

    await t.throws(async () => { await delay(1); throw new Error('oopsie') }, 'oop')

    await t.throws(async () => { await delay(1); throw new Error('oopsie') }, /OOP/i)


    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.throws(() => {})

        t.throws(() => { throw new Error('oopsie') }, 'zooka')

        t.throws(() => { throw new Error('oopsie') }, /zooka/i)


        //------------------
        await t.throws(async () => { await delay(1) })

        await t.throws(async () => { await delay(1); throw new Error('oopsie') }, 'zooka')

        await t.throws(async () => { await delay(1); throw new Error('oopsie') }, /zooka/i)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`doesNotThrow` assertion should work', async t => {

    //------------------
    t.doesNotThrow(() => {})


    //------------------
    await t.doesNotThrow(async () => {})

    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.doesNotThrow(() => { throw new Error('zooka') })


        //------------------
        await t.doesNotThrow(async () => { await delay(1); throw new Error('zooka') })

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})
