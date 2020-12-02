import { it } from "../../../main.js"
import { CustomTest } from "../src/CustomTest.js"


CustomTest.describe('Basic assertions should work', t => {
    t.ok(true, 'True is ok')
})


CustomTest.describe('Basic assertions should work #2', t => {
    t.ok(true, 'True is ok')

    t.log("Log message")

    t.warn("Warning message")

    t.error("Error message")
})
