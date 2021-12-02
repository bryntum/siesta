import { it } from "../../../browser.js"

it('Sample test', async t => {
    t.is(1, 1)

    t.equal([ 1 ], [ 1 ])

    //----------------------------------
    // need to have the async assertions in the sample suite
    // to verify their serialization in the reports
    await t.waitFor(1)

    let flag = false

    setTimeout(() => flag = true, 10)

    t.waitFor(() => flag)
})
