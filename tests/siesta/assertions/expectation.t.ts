import { describe, it } from "../../../main.js"
import { any } from "../../../src/util/CompareDeep.js"
import { delay } from "../../../src/util/Helpers.js"
import { verifyAllFailed } from "../helpers.js"

/**

Most of the assertions here uses the same internal methods, which are tested thoroughly
in other tests. For such methods, the coverage is less detailed.

*/

//-------------------------------------------------------
it('`expect().toBe() should work`', async t => {

    //------------------
    t.expect(1).toBe(1)

    t.expect(1).not.toBe(2)

    //------------------
    t.todo('Should all fail', async t => {

        t.expect(1).not.toBe(1)

        t.expect(1).toBe(2)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
describe('Before/after should work #1', t => {
    // t.expect(1).toBeCloseTo(1.01, 1)
    // t.expect(1).not.toBeCloseTo(1.01, 2)
})


//-------------------------------------------------------
it('`expect().toBeNull()/toBeNaN()/toBeDefined/toBeUndefined() should work`', async t => {

    //------------------
    t.expect(null).toBeNull()
    t.expect(NaN).toBeNaN()
    t.expect(null).toBeDefined()
    t.expect(undefined).toBeUndefined()

    //------------------
    t.expect(undefined).not.toBeNull()
    t.expect(null).not.toBeNaN()
    t.expect(undefined).not.toBeDefined()
    t.expect(null).not.toBeUndefined()


    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.expect(null).not.toBeNull()
        t.expect(NaN).not.toBeNaN()
        t.expect(null).not.toBeDefined()
        t.expect(undefined).not.toBeUndefined()

        //------------------
        t.expect(undefined).toBeNull()
        t.expect(null).toBeNaN()
        t.expect(undefined).toBeDefined()
        t.expect(null).toBeUndefined()

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`expect().toContain() should work`', async t => {

    //------------------
    t.expect([ 1 ]).toContain(1)

    t.expect(new Set([ 1 ])).toContain(1)

    //------------------
    t.expect([ 2 ]).not.toContain(1)

    t.expect(new Set([ 2 ])).not.toContain(1)


    //------------------
    t.todo('Should all fail', async t => {

        //------------------
        t.expect([ 1 ]).not.toContain(1)

        t.expect(new Set([ 1 ])).not.toContain(1)

        //------------------
        t.expect([ 2 ]).toContain(1)

        t.expect(new Set([ 2 ])).toContain(1)

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`expect().toMatch()/toContain(string) should work`', async t => {

    //------------------
    t.expect('ZOOKA').toMatch(/zooka/i)

    t.expect('ZOOKA').toContain('OO')

    t.expect('ZOOKA').not.toMatch(/kuki/i)

    t.expect('ZOOKA').not.toContain('zops')


    //------------------
    t.todo('Should all fail', async t => {

        t.expect('ZOOKA').not.toMatch(/zooka/i)

        t.expect('ZOOKA').not.toContain('OO')

        t.expect('ZOOKA').toMatch(/kuki/i)

        t.expect('ZOOKA').toContain('zops')

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`expect().toEqual() should work`', async t => {

    //------------------
    t.expect([]).toEqual([])

    t.expect([]).not.toEqual([ 1 ])

    //------------------
    t.todo('Should all fail', async t => {

        t.expect([]).not.toEqual([])

        t.expect([]).toEqual([ 1 ])

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`expect().toBeTruthy/Falsy() should work`', async t => {

    //------------------
    t.expect(true).toBeTruthy()

    //------------------
    t.todo('Should all fail', async t => {

        t.expect(false).toBeTruthy()

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`expect().toThrow() should work`', async t => {

    //------------------
    t.expect(() => { throw new Error('oopsie') }).toThrow()

    await t.expect(async () => { await delay(1); throw new Error('oopsie') }).toThrow()

    //------------------
    t.expect(() => {}).not.toThrow()

    await t.expect(async () => { await delay(1) }).not.toThrow()


    //------------------
    t.todo('Should all fail', async t => {

        t.expect(() => {}).toThrow()

        await t.expect(async () => { await delay(1) }).toThrow()

        //------------------
        t.expect(() => { throw new Error('zooka') }).not.toThrow()

        await t.expect(async () => { await delay(1); throw new Error('zooka') }).not.toThrow()


    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})
