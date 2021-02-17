import { describe } from "../../index.js"
import { Assertion } from "../../src/siesta/test/TestResult.js"
import { delay } from "../../src/util/Helpers.js"

//-------------------------------------------------------
let log : string[]      = []

describe('Before/after should work #1', t => {

    t.it('Root', t => {
        log.push('Root')

        t.beforeEach(t => {
            log.push('Root-beforeEach1')
        })

        t.it("Root->Spec1", t => {
            log.push('Root->Spec1')

            t.beforeEach(t => {
                log.push('Spec1-beforeEach')
            })

            t.it('Root->Spec1->Spec11', t => {
                log.push('Root->Spec1->Spec11')
            })

            t.it('Root->Spec1->Spec12', t => {
                log.push('Root->Spec1->Spec12')
            })
        })
    })
}).finishHook.on(t => {
    t.isDeeply(log,
        [
            'Root',
                'Root-beforeEach1',
                'Root->Spec1',

                'Root-beforeEach1',
                'Spec1-beforeEach',
                'Root->Spec1->Spec11',

                'Root-beforeEach1',
                'Spec1-beforeEach',
                'Root->Spec1->Spec12',
        ],
        'Correctly called all before/after actions'
    )
})


//-------------------------------------------------------
let log2 : string[]      = []

describe('Before/after should work #2', t => {

    t.it('Root', t => {
        log2.push('Root')

        t.beforeEach(t => {
            log2.push('Root-beforeEach1')
        })

        t.beforeEach(async t => {
            await delay(10)
            log2.push('Root-beforeEach2')
        })

        t.afterEach(t => {
            log2.push('Root-afterEach1')
        })

        t.afterEach(async t => {
            await delay(10)
            log2.push('Root-afterEach2')
        })

        t.it("Root->Spec1", t => {
            log2.push('Root->Spec1')

            t.beforeEach(t => {
                log2.push('Spec1-beforeEach')
            })

            t.afterEach(t => {
                log2.push('Spec1-afterEach')
            })

            t.it('Root->Spec1->Spec11', t => {
                log2.push('Root->Spec1->Spec11')
            })
        })

    })

}).finishHook.on(t => {
    t.isDeeply(log2,
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


//-------------------------------------------------------
describe('Should be possible to add assertions in the `before/afterEach`', t => {

    t.it('Root', t => {

        t.beforeEach(t => {
            t.pass("before")
        })

        t.afterEach(t => {
            t.pass("after")
        })

        t.it("Spec1", t => {
            t.it("Spec2", t => {
            })
        })
    })

}).finishHook.on(t => {
    const childNodes        = t.childNodes

    t.is(childNodes.length, 1)

    const spec1 = childNodes[ 0 ].childNodes[ 0 ]

    t.is((spec1.resultLog[ 0 ] as Assertion).description, 'before')
    t.is((spec1.resultLog[ 2 ] as Assertion).description, 'after')

    const spec2 = spec1.childNodes[ 0 ]

    t.is((spec2.resultLog[ 0 ] as Assertion).description, 'before')
    t.is((spec2.resultLog[ 1 ] as Assertion).description, 'after')
})
