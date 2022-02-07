import { it, xit } from "../../index.js"
import { equalDeep } from "../../src/compare_deep/DeepDiff.js"


it('Deep compare of primitives should work', async t => {
    t.equal(equalDeep(1, 1), true)

    t.equal(equalDeep("string", "string"), true)

    t.equal(equalDeep(1, '1'), false)

    t.equal(equalDeep(/a/, /a/), true)

    t.equal(equalDeep(/a/, /a/i), false)
})


it('Deep compare of arrays should work', async t => {
    t.equal(equalDeep([ 1 ], [ 0 ]), false)

    t.equal(equalDeep([ 1, 1 ], [ 1, 1 ]), true)
})


it('Deep compare of objects should work', async t => {
    t.equal(equalDeep({}, {}), true)

    t.equal(equalDeep({ a : 1 }, { a : 1 }), true)

    t.equal(equalDeep({ a : 1, b : 3 }, { a : 2, c : 4 }), false)


    t.equal(equalDeep(new Error('error1'), new Error('error2')), false)
})


it('Deep compare of sets should work', async t => {
    t.equal(equalDeep(new Set(), new Set()), true)

    t.equal(equalDeep(new Set([ 1, 2, 3 ]), new Set([ 2, 3, 4 ])), false)
})


it('Deep compare of maps should work', async t => {
    t.equal(equalDeep(new Map(), new Map()), true)

    t.equal(equalDeep(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], ]), new Map([ [ 2, 2 ], [ 3, 3 ], [ 4, 4 ], ])), false)
})


it('Deep compare should work with circular data structures #1', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    t.equal(equalDeep(a1, a2), true)
})


it('Deep compare should work with circular data structures #2', async t => {
    const a1    = { a : undefined }
    a1.a        = a1

    const a2    = { a : undefined }
    a2.a        = a2

    const a3    = { a : a2 }

    t.equal(equalDeep(a1, a3), true)
})


it('Deep compare should work with circular data structures #3', async t => {
    const a     = [ { ref : null }, { ref : null } ]

    a[ 0 ].ref  = a[ 1 ]
    a[ 1 ].ref  = a[ 0 ]

    const b     = [ { ref : null }, { ref : null } ]

    b[ 0 ].ref  = b[ 1 ]
    b[ 1 ].ref  = b[ 1 ]

    t.equal(equalDeep(a, b), false)
})


it('Deep compare should work with circular data structures #4', async t => {
    const b11   = { next : undefined }
    const b21   = { prev : undefined }

    b11.next    = b21
    b21.prev    = b11

    const c11   = { next : undefined }
    const c21   = { prev : undefined }

    c11.next    = c21
    c21.prev    = c11

    t.equal(equalDeep(b11, c11), true)
})


it('Deep compare should work with circular data structures #5', async t => {
    const child     = { parent : undefined, children : [] }
    const parent    = { parent : undefined, children : [ child ] }
    child.parent    = parent

    t.equal(equalDeep(child, parent), false)
})


it('Dates should be compared as values, not as objects', async t => {
    const dateGen       = () => new Date(2020, 1, 1)
    const date          = dateGen()

    const v1            = [ date, date ]
    const v2            = [ dateGen(), dateGen()]

    t.equal(equalDeep(v1, v2), true)
})


it('Deep compare should not recurse into the referentially identical objects', async t => {
    const obj           = { prop : 'value', set : null }
    const set           = new Set([ obj ])
    obj.set             = set

    // here the `obj` is referentially identical on both sides, however, structurally its different
    // (contains cyclic reference to `set` on left side and non-cyclic on right)
    t.equal(equalDeep(set, new Set([ obj ])), true)
})


it('Deep compare should handle the "distant" cycles', async t => {
    const a1            = { a : { a : null } }
    a1.a.a              = a1

    const a2            = { a : { a : null } }
    a2.a.a              = a2

    t.is(equalDeep(a1, a2), true)
})


// TODO, this case is not supported yet (do we need to support it at all?)
xit('Deep compare should handle the cycles of different length #1', async t => {
    const a1            = { a : null }
    a1.a                = a1

    const a2            = { a : { a : { a : null } } }
    a2.a.a.a            = a2

    t.is(equalDeep(a1, a2), false)
})


it('Deep compare should handle the cycles of different length #2', async t => {
    const a1            = { a : { a : null } }
    a1.a.a              = a1

    const a2            = { a : { a : { a : null } } }
    a2.a.a.a            = a2

    t.is(equalDeep(a1, a2), false)
})
