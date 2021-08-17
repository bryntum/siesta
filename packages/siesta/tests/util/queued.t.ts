import { it } from "../../index.js"
import { queued } from "../../src/util/Queued.js"
import { delay } from "../../src/util/TimeHelpers.js"

class SomeClass {
    log         : string[]  = []

    @queued()
    async summer (a : number) : Promise<number> {
        this.log.push('start')

        if (a > 100) {
            this.log.push('error')
            throw new Error("error")
        }

        await delay(10)

        this.log.push('finish')

        return a + 1
    }
}

// in this class 2 different methods are queued into single queue
class AnotherClass {
    log         : string[]  = []

    // recommended to declare the queue prop to have the class shape
    // known for the v8
    $queue      : any       = undefined

    @queued('$queue')
    async summer1 (a : number) : Promise<number> {
        this.log.push('start1')

        if (a > 100) {
            this.log.push('error1')
            throw new Error("error1")
        }

        await delay(10)

        this.log.push('finish1')

        return a + 1
    }

    @queued('$queue')
    async summer2 (a : number) : Promise<number> {
        this.log.push('start2')

        if (a > 100) {
            this.log.push('error2')
            throw new Error("error2")
        }

        await delay(10)

        this.log.push('finish2')

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


it('Should support queueing several methods in a single queue', async t => {
    const instance = new AnotherClass()

    const p1        = instance.summer1(1)
    const p2        = instance.summer2(2)
    const p3        = instance.summer1(101)
    const p4        = instance.summer2(101)
    const p5        = instance.summer1(3)

    const res       = await Promise.allSettled([ p1, p2, p3, p4, p5 ])

    t.equal(
        res,
        [
            { status : 'fulfilled', value : 2 },
            { status : 'fulfilled', value : 3 },
            { status : 'rejected', reason : new Error('error1') },
            { status : 'rejected', reason : new Error('error2') },
            { status : 'fulfilled', value : 4 },
        ]
    )

    t.equal(
        instance.log,
        [
            'start1', 'finish1',
            'start2', 'finish2',
            'start1', 'error1',
            'start2', 'error2',
            'start1', 'finish1',
        ]
    )
})

