import { describe } from "../../index.js"
import { Assertion } from "../../src/siesta/test/TestResult.js"

//-------------------------------------------------------
describe('Todo tests should not fail', t => {
    t.todo('Todo test', t => {
        t.is(1, 2, 'todo1')

        t.it('Nested test should become todo as well', t => {
            t.is(2, 3, 'todo2')
        })
    })

}).finishHook.on(t => {
    t.true(t.passed)

    const spec1 = t.childNodes[ 0 ]

    t.true(spec1.isTodo)

    t.is((spec1.resultLog[ 0 ] as Assertion).description, 'todo1')

    const spec2 = spec1.childNodes[ 0 ]

    t.true(spec2.isTodo)

    t.is((spec2.resultLog[ 0 ] as Assertion).description, 'todo2')
})

