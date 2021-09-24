import { it } from "../../index.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Todo tests should not fail', t => {
    t.todo('Todo test', t => {
        t.is(1, 1, 'todo1')

        t.is(1, 2, 'todo2')

        t.it('Nested test should become todo as well', t => {
            t.is(2, 3, 'todo3')
        })
    })

}).finishHook.on(t => {
    t.true(t.passed)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const spec1     = t.childNodes[ 0 ]

    t.true(spec1.passed)
    t.false(spec1.passedRaw)
    t.true(spec1.isTodo)

    t.true(spec1.assertions[ 0 ].passed)
    t.false(spec1.assertions[ 1 ].passed)

    t.is(spec1.assertions[ 0 ].description, 'todo1')
    t.is(spec1.assertions[ 1 ].description, 'todo2')

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    const spec2     = spec1.childNodes[ 0 ]

    t.true(spec2.passed)
    t.false(spec2.passedRaw)
    t.true(spec2.isTodo)

    t.is(spec2.assertions[ 0 ].description, 'todo3')
    t.false(spec2.assertions[ 0 ].passed)
})

