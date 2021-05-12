import { it, Test } from "siesta/deno.js"
import { delay } from "../../src/module.js"

it('Using `delay` should work', async (t : Test) => {
    const start     = Date.now()

    const time      = 100

    await delay(time)

    const end       = Date.now()

    t.isGreaterOrEqual(end - start, time, `Should await at least the ${ time }ms`)

    t.expect(end - start).toBeGreaterOrEqualThan(time)
})

