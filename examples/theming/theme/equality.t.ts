import { it } from "../../../index.js"

it('Theming of the equality assertions', async t => {

    t.is(11, 18)

    t.is({ abc : 'def' }, { ghi : 'jkl'})

    t.equal({ arr : [ 1, 2, 3, 4 ], unexpected : 'Unexpected' }, { arr : [ 0, 2 ], expected : 'Expected' })
})

