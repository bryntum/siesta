import { it } from "../../nodejs.js"
import { delay } from "../../src/util/Helpers.js"
import { queued } from "../../src/util/Queued.js"

class SomeClass {

    log         : string[]  = []

    @queued()
    async summer (a : number) : Promise<number> {
        this.log.push('start')

        if (a > 100) {
            this.log.push('error')
            throw new Error("error")
        }

        await delay(100)

        this.log.push('finish')

        return a + 1
    }
}


it('Queued method should work', async t => {
    const someInstance = new SomeClass()

    // start 3 calls simultaneously, 2nd one is failing
    const p1        = someInstance.summer(1)
    const p2        = someInstance.summer(101)
    const p3        = someInstance.summer(2)

    const res       = await Promise.allSettled([ p1, p2, p3 ])

    t.equal(
        res,
        [
            { status : 'fulfilled', value : 2 },
            { status : 'rejected', reason : new Error('error') },
            { status : 'fulfilled', value : 3 },
        ]
    )

    t.equal(
        someInstance.log,
        [
            'start', 'finish',
            'start', 'error',
            'start', 'finish'
        ]
    )
})
