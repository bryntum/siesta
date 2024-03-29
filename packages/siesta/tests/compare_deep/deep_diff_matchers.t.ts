import { it } from "../../index.js"
import { equalDeep } from "../../src/compare_deep/DeepDiff.js"
import {
    any,
    anyArrayContaining,
    anyInstanceOf,
    anyNumberApprox, anyObjectContaining,
    anyStringLike
} from "../../src/compare_deep/DeepDiffFuzzyMatcher.js"


it('Deep compare should work for number fuzzy matcher', async t => {
    t.equal(
        equalDeep(10, anyNumberApprox(10)),
        true
    )

    t.equal(
        equalDeep(10.5, anyNumberApprox(10)),
        true
    )

    t.equal(
        equalDeep(10.1, anyNumberApprox(10, { percent : 1 })),
        true
    )

    t.equal(
        equalDeep(1.0512, anyNumberApprox(1.051, { digits : 3 })),
        true
    )

    t.equal(
        equalDeep(1.1599999, anyNumberApprox(1.15, { digits : 2 })),
        true
    )

    t.equal(
        equalDeep(10.12, anyNumberApprox(10.123, { digits : 2 })),
        true
    )

    t.equal(
        equalDeep(1.061, anyNumberApprox(1.05, { digits : 2 })),
        false
    )

    t.equal(
        equalDeep(1, anyNumberApprox(1.03, { percent : 2 })),
        false
    )

    //------------------------
    const matcher   = anyNumberApprox(10)

    t.equal(
        equalDeep('10', matcher),
        false
    )
})


it('Deep compare should work for string fuzzy matcher', async t => {
    t.equal(equalDeep('10', anyStringLike('1')), true)

    t.equal(equalDeep('FOO', anyStringLike(/foo/i)), true)


    t.equal(equalDeep(1, anyStringLike(/foo/i)), false)

    t.equal(equalDeep('bar', anyStringLike(/foo/i)), false)
})


it('Deep compare should work for "instance" fuzzy matcher', async t => {
    t.equal(equalDeep(false, anyInstanceOf(Boolean)), true)

    t.equal(equalDeep('foo', anyInstanceOf(String)), true)

    t.equal(equalDeep(10, anyInstanceOf(Number)), true)

    t.equal(equalDeep(new Date, anyInstanceOf(Date)), true)

    t.equal(equalDeep(new Date, anyInstanceOf(Object)), true)

    t.equal(equalDeep({}, anyInstanceOf(Object)), true)

    t.equal(equalDeep([ 1, 2, 3 ], anyInstanceOf(Array)), true)

    t.equal(equalDeep(() => {}, anyInstanceOf(Function)), true)

    t.equal(equalDeep('10', anyInstanceOf(Date)), false)
})


it('Deep compare should work for "any" fuzzy matcher', async t => {
    t.equal(equalDeep(10, any()), true)

    t.equal(equalDeep(new Date, any()), true)

    t.equal(equalDeep([ 1, 2, 3 ], any()), true)
})


it('Deep compare should work for "anyArrayContaining" fuzzy matcher', async t => {
    t.equal(equalDeep([], anyArrayContaining([])), true)

    t.equal(equalDeep([], anyArrayContaining([ 1 ])), false)

    t.equal(equalDeep([ 1 ], anyArrayContaining([ 1 ])), true)

    t.equal(equalDeep([ 1, 2, 3 ], anyArrayContaining([ 2 ])), true)

    t.equal(equalDeep([ 1, { a : 1 }, 3, { b : 2 } ], anyArrayContaining([ { a : 1 }, { b : 2 } ])), true)

    t.equal(equalDeep([ 1, { a : 1 }, 3, { b : 2 } ], anyArrayContaining([ { a : 1 }, { b : t.any(Number) } ])), true)
})


it('Deep compare should work for "anyObjectContaining" fuzzy matcher', async t => {
    t.equal(equalDeep({}, anyObjectContaining({})), true)

    t.equal(equalDeep({}, anyObjectContaining({ a : 1 })), false)

    t.equal(equalDeep({ a : 1 }, anyObjectContaining({ a : 1 })), true)

    t.equal(equalDeep({ a : { b : 2 }, c : 3 }, anyObjectContaining({ a : { b : 2 } })), true)

    t.equal(equalDeep({ a : { b : 2 }, c : 3 }, anyObjectContaining({ a : { b : t.any(Number) } })), true)
})
