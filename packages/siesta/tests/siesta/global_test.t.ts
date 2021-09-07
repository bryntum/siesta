import { afterEach, beforeEach, describe, it } from "../../index.js"
import { delay } from "../../src/util/TimeHelpers.js"

//-------------------------------------------------------
describe('Should be possible to nest calls to global `it/describe``', t => {

    it('Root', async t => {
        await delay(10)

        it("Spec1", async t => {

            it("Spec2", async t => {
                await delay(10)
            })

            await delay(10)
        })
    })

}).finishHook.on(t => {
    const spec1 = t.childNodes[ 0 ]

    t.is(spec1.descriptor.title, 'Root')

    const spec2 = spec1.childNodes[ 0 ]

    t.is(spec2.descriptor.title, 'Spec1')

    const spec3 = spec2.childNodes[ 0 ]

    t.is(spec3.descriptor.title, 'Spec2')
})


//-------------------------------------------------------
let log2 : string[]      = []

describe('Should be possible to use global `before/afterEach`', t => {

    it('Root', t => {
        log2.push('Root')

        beforeEach(t => {
            log2.push('Root-beforeEach1')
        })

        beforeEach(async t => {
            await delay(10)
            log2.push('Root-beforeEach2')
        })

        afterEach(t => {
            log2.push('Root-afterEach1')
        })

        afterEach(async t => {
            await delay(10)
            log2.push('Root-afterEach2')
        })

        it("Root->Spec1", t => {
            log2.push('Root->Spec1')

            beforeEach(t => {
                log2.push('Spec1-beforeEach')
            })

            afterEach(t => {
                log2.push('Spec1-afterEach')
            })

            it('Root->Spec1->Spec11', t => {
                log2.push('Root->Spec1->Spec11')
            })
        })

    })

}).finishHook.on(t => {
    t.equal(log2,
        [
            'Root',
                'Root-beforeEach1',
                'Root-beforeEach2',
                'Root->Spec1',
                    'Root-beforeEach1',
                    'Root-beforeEach2',
                    'Spec1-beforeEach',
                    'Root->Spec1->Spec11',
                    'Spec1-afterEach',
                    'Root-afterEach1',
                    'Root-afterEach2',
                'Root-afterEach1',
                'Root-afterEach2',
        ],
        'Correctly called all before/after actions'
    )
})
