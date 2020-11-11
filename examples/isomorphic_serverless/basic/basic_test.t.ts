import { describe, it } from "../../../main.js"

it('Basic assertions should work', t => {
    t.ok(true, 'True is ok')

    t.is(null, undefined, 'Null is undefined')

    t.is(1, 2, '1 is 2')

    t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
})


describe({
    name        : 'Basic assertions should work',
    env         : 'generic', // 'generic' | 'browser' | 'nodejs'
    tags        : [ 'basic', 'generic', 'data', 'model' ],
}, t => {
    t.ok(true, 'True is ok')

    t.is(null, undefined, 'Null is undefined')

    t.is(1, 2, '1 is 2')

    t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')


    t.it('Sub test', t => {
        t.ok(true, 'True is ok')

        t.is(null, undefined, 'Null is undefined')

        t.is(1, 2, '1 is 2')

        t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
    })
})

