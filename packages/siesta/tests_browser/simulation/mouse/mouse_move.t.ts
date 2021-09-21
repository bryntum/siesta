import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should always visit last point in the mousemove path', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 123px; left: 657px; width: 1px; height: 1px; background: red;" id="marker"></div>'

    t.firesOnce('#marker', 'mouseenter')

    await t.moveMouseTo([ 657, 123 ])

    t.equal(t.simulator.currentPosition, [ 657, 123 ], 'Moved cursor to correct point')
})
