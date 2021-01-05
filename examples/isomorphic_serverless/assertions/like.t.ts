import { describe } from "../../../main.js"
import { delay } from "../../../src/util/Helpers.js"

describe('`like`assertion should work', async t => {

    t.like('Fobz', /fo/i, '`like` should work')

    t.like('Fobz', /foo/i, '`like` should work')

    t.like('Fobz', 'Fobx', '`like` should work')

    t.like('Fobz', 'Fob', '`like` should work')
})

