import { describe } from "../../../index.js"

describe('`like`assertion should work', async t => {

    t.throws(() => {
        throw new Error("Error")
    }, 'Errorz')

    t.doesNotThrow(() => {
        throw new Error("Errorz")
    })
})

