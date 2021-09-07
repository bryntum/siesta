import { it } from "../../../browser.js"
import { filterPathAccordingToPrecision, getPathBetweenPoints } from "../../../src/util_browser/Coordinates.js"


it('Should filter path according to precision: fixed', async t => {
    const path      = getPathBetweenPoints([ 0, 0 ], [ 9, 9 ])

    const filtered1 = filterPathAccordingToPrecision(path, { kind : 'fixed', precision : 1 })
    t.equal(filtered1, [ [ 9, 9 ] ])

    const filtered2 = filterPathAccordingToPrecision(path, { kind : 'fixed', precision : 2 })
    t.equal(filtered2, [ [ 1, 1 ], [ 9, 9 ] ])

    const filtered3 = filterPathAccordingToPrecision(path, { kind : 'fixed', precision : 3 })
    t.equal(filtered3, [ [ 1, 1 ], [ 6, 6 ], [ 9, 9 ] ])

    const filtered4 = filterPathAccordingToPrecision(path, { kind : 'fixed', precision : 4 })
    t.equal(filtered4, [ [ 1, 1 ], [ 4, 4 ], [ 7, 7 ], [ 9, 9 ] ])
})


it('Should filter path according to precision: every-nth', async t => {
    const path      = getPathBetweenPoints([ 0, 0 ], [ 9, 9 ])

    const filtered1 = filterPathAccordingToPrecision(path, { kind : 'every_nth', precision : 1 })
    t.equal(filtered1, path)

    const filtered2 = filterPathAccordingToPrecision(path, { kind : 'every_nth', precision : 2 })
    t.equal(filtered2, [ [ 1, 1 ], [ 2, 2 ], [ 4, 4 ], [ 6, 6 ], [ 8, 8 ], [ 9, 9 ] ])

    const filtered3 = filterPathAccordingToPrecision(path, { kind : 'every_nth', precision : 3 })
    t.equal(filtered3, [ [ 1, 1 ], [ 2, 2 ], [ 5, 5 ], [ 8, 8 ], [ 9, 9 ] ])
})


it('Should filter path according to precision: last_only', async t => {
    const path      = getPathBetweenPoints([ 0, 0 ], [ 9, 9 ])

    const filtered1 = filterPathAccordingToPrecision(path, { kind : 'last_only', precision : 1 })
    t.equal(filtered1, [ [ 9, 9 ] ])

    const filtered2 = filterPathAccordingToPrecision(path, { kind : 'last_only', precision : 2 })
    t.equal(filtered2, [ [ 8, 8 ], [ 9, 9 ] ])

    const filtered3 = filterPathAccordingToPrecision(path, { kind : 'last_only', precision : 3 })
    t.equal(filtered3, [ [ 7, 7 ], [ 8, 8 ], [ 9, 9 ] ])
})


it('Should filter path according to precision: first_and_last', async t => {
    const path      = getPathBetweenPoints([ 0, 0 ], [ 9, 9 ])

    const filtered1 = filterPathAccordingToPrecision(path, { kind : 'first_and_last', precision : 1 })
    t.equal(filtered1, [ [ 1, 1 ], [ 9, 9 ] ])

    const filtered2 = filterPathAccordingToPrecision(path, { kind : 'first_and_last', precision : 2 })
    t.equal(filtered2, [ [ 1, 1 ], [ 2, 2 ], [ 8, 8 ], [ 9, 9 ] ])

    const filtered3 = filterPathAccordingToPrecision(path, { kind : 'first_and_last', precision : 3 })
    t.equal(filtered3, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 7, 7 ], [ 8, 8 ], [ 9, 9 ] ])
})


it('Should filter path according to precision: first_and_last #2', async t => {
    const path      = getPathBetweenPoints([ 0, 0 ], [ 4, 4 ])

    const filtered1 = filterPathAccordingToPrecision(path, { kind : 'first_and_last', precision : 1 })
    t.equal(filtered1, [ [ 1, 1 ], [ 4, 4 ] ])

    const filtered2 = filterPathAccordingToPrecision(path, { kind : 'first_and_last', precision : 2 })
    t.equal(filtered2, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ])

    const filtered3 = filterPathAccordingToPrecision(path, { kind : 'first_and_last', precision : 3 })
    t.equal(filtered3, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ])
})
