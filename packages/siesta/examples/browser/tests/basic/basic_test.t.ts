import { it, Test } from "@bryntum/siesta/index.js"

it('Basic Siesta Node.js test', async (t : Test) => {
    t.true(true, "That's true")

    t.true(false, "That's not true")
})


it('Deep equality should work', async (t : Test) => {
    t.equal([ 1, 2, 3 ], [ 3, 2, 1 ], "Arrays are deeply equal")

    t.expect(
        { receivedKey : 'receivedValue', commonKey : 'commonValue' }
    ).toEqual(
        { expectedKey : 'expectedValue', commonKey : 'commonValue' }
    )
})
