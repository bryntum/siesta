import { it } from "../../../index.js"
import { delay } from "../../../src/util/Helpers.js"
import { CustomTest } from "../src/CustomTest.js"


CustomTest.describe('Basic assertions should work', async t => {
    t.ok(true, 'True is ok')

    await delay(500)
})


CustomTest.describe('Basic assertions should work #2', async t => {
    await delay(500)

    t.ok(true, 'True is ok')

    t.error("Error message")

    t.warn("Warning message")

    t.log("Log message")

    t.debug("Debug message")

    t.info("Info message")
})
