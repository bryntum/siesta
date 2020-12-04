import { describe } from "../../../main.js"
import { delay } from "../../../src/util/Helpers.js"

describe({
    env         : 'generic', // 'generic' | 'browser' | 'nodejs'
    tags        : [ 'basic', 'generic', 'data', 'model' ],
    title       : 'Basic assertions should work',
}, async t => {
    t.ok(true, 'True is ok')

    // t.is(null, undefined, 'Null is undefined')
    //
    // t.is(1, 2, '1 is 2')
    //
    // t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')


    await delay(3000)

    const start     = Date.now()

    await t.waitFor(() => Date.now() - start > 3000)

    t.it('Sub test #1', t => {
        t.ok(true, 'True is ok')

        t.is(null, undefined, 'Null is undefined')

        t.is(1, 2, '1 is 2')

        t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
    })


    t.it('Sub test #2', t => {
        t.ok(true, 'True is ok')

        t.is(null, undefined, 'Null is undefined')

        t.is(1, 2, '1 is 2')

        t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
    })

})

