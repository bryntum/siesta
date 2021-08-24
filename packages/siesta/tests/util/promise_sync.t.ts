import { it } from "../../index.js"
import { PromiseSync } from "../../src/util/PromiseSync.js"

it('PromiseSync resolution detection should work', async t => {

    const promise       = new PromiseSync<number>((resolve, reject) => {
        setTimeout(() => resolve(10), 1)
    })

    t.false(promise.isResolved())
    t.false(promise.isRejected())

    await promise

    t.true(promise.isResolved())
    t.false(promise.isRejected())

    t.is(promise.resolved, 10)
})


it('PromiseSync rejection detection should work', async t => {

    const promise       = new PromiseSync<number>((resolve, reject) => {
        setTimeout(() => reject('reason'), 1)
    })

    t.false(promise.isResolved())
    t.false(promise.isRejected())

    try {
        await promise
    } catch (e) {
    }

    t.false(promise.isResolved())
    t.true(promise.isRejected())

    t.is(promise.rejected, 'reason')
})
