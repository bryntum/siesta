import { it } from "../../../index.js"

it('Theming of the `like`assertion', async t => {

    t.like('Fobz', /fo/i, '`like` should work')

    t.like('Fobz', /foo/i, '`like` should work')

    t.like('Fobz', 'Fobx', '`like` should work')

    t.like('Fobz', 'Fob', '`like` should work')
})

