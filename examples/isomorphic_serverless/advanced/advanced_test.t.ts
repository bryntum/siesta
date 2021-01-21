import { describe } from "../../../main.js"

describe({
    tags        : [ 'basic', 'generic', 'data', 'model' ],
    title       : 'Basic assertions should work',
}, async t => {
    t.ok(true, 'True is ok')

    // t.is(null, undefined, 'Null is undefined')
    //
    // t.is(1, 2, '1 is 2')
    //
    // t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')


    const start     = Date.now()

    await t.waitFor(() => Date.now() - start > 500, 'Wait for 3s')

    t.it('Sub test #1', t => {
        t.ok(true, 'True is ok')

        t.is(null, undefined, 'Null is undefined')

        // @ts-ignore
        t.isDeeply(1, '2', '1 is 2')

        t.isDeeply({ prop1 : 1, prop2 : new Date() }, { prop1 : '2', prop2 : 11 }, '1 is 2')

        t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
    })


    t.it('Sub test #2', t => {
        t.ok(true, 'True is ok')

        t.is(null, undefined, 'Null is undefined')

        t.is(1, 2, '1 is 2')

        t.is(new Date(2010, 1, 1), new Date(2010, 1, 1), 't.is works for dates')
    })

})

