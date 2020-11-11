import { it } from "../../../main.js"

it('Basic assertions should work', t => {
    t.ok(true, 'True is ok')

    t.is(null, undefined, 'Null is undefined')

    t.is(1, 2, '1 is 2')

    t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
})
