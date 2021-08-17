import { it, Test } from "siesta/nodejs.js"
import { summer } from "../../src/module.js"

it('Using `summer` should work', async (t : Test) => {
    t.is(await summer(1, 1), 2, "Correct summer result #1")

    t.expect(await summer(1, 2)).toBe(3)

    t.expect(await summer(2, 3)).toBe(5)
})

