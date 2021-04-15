import { it } from "../../../index.js"

it('Theming of the `throws/doesNotThrow` assertions', async t => {

    t.throws(() => {
        throw new Error("Error")
    }, 'Errorz')

    t.doesNotThrow(() => {
        throw new Error("Errorz")
    })

    t.doesNotThrow(() => {
        throw new Error("Errorz")
    })
})

