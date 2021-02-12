import { describe } from "../../main.js"
import { any } from "../../src/util/CompareDeep.js"

//-------------------------------------------------------
describe('Before/after should work #1', t => {
    t.expect(1).toBe(1)
    t.expect(1).not.toBe(2)

    t.expect(1).toBe(any(Number))

    t.expect(() => {}).toBe(any(Function))
    t.expect(() => {}).toBe(any(Object))

    t.expect([]).toEqual([])
    t.expect([]).not.toEqual([ 1 ])

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

    // t.expect(function () {
    //     throw 1;
    // }).toThrow()
    //
    // t.expect(function () {
    // }).not.toThrow()
    //
})
