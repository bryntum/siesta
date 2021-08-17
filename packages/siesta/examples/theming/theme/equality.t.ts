import { it } from "../../../index.js"

it('Theming of the equality assertions', async t => {

    t.is(11, 18)

    t.is({ abc : 'def' }, { ghi : 'jkl'})

    t.equal(
        {
            map : new Map([ [ { key1 : 'value1' }, 1 ] ]),
            array : [ 'unequal', 'equal', 'extra' ],
            unexpected : 'unexpected'
        },
        {
            map : new Map([ [ { key1 : 'value1' }, 1 ], [ { key2 : 'value2' }, 1 ] ]),
            array : [ 'UNEQUAL', 'equal' ],
            expected : 'expected'
        }
    )
})

