import { describe, it } from "../../../main.js"
import { any } from "../../../src/util/CompareDeep.js"
import { delay } from "../../../src/util/Helpers.js"
import { verifyAllFailed } from "../helpers.js"

/**

Most of the assertions here uses the same internal methods, which are tested thoroughly
in other tests. For such methods, the coverage is less detailed.

*/

//-------------------------------------------------------
describe('Before/after should work #1', t => {
    t.expect(1).toBe(1)
    t.expect(1).not.toBe(2)

    t.expect(1).toBe(any(Number))

    t.expect(() => {}).toBe(any(Function))
    t.expect(() => {}).toBe(any(Object))

    t.expect([]).not.toBeNull()
    t.expect(null).toBeNull()

    t.expect(NaN).toBeNaN()

    t.expect(function () {}).toBeDefined()
    t.expect(1).toBeDefined()
    t.expect(undefined).toBeUndefined()

    t.expect("asd").toMatch(/asd/)

    t.expect([ 1 ]).toContain(1)

    t.expect([ 2 ]).not.toContain(1)

    t.expect("asd").toContain("a")
    t.expect("asd").not.toContain("z")

    t.expect(1).toBeCloseTo(1.01, 1)
    t.expect(1).not.toBeCloseTo(1.01, 2)
})


//-------------------------------------------------------
it('`expect(func).toEqual should work`', async t => {

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
it('`expect(func).toBeTruthy/Falsy() should work`', async t => {

    //------------------
    t.expect(true).toBeTruthy()

    //------------------
    t.todo('Should all fail', async t => {

        t.expect(false).toBeTruthy()

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})


//-------------------------------------------------------
it('`expect(func).toThrow() should work`', async t => {

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
