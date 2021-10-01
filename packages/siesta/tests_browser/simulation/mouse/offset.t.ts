import { beforeEach, it, TestBrowser } from "../../../browser.js"
import { ActionTargetOffset } from "../../../src/siesta/simulate/Types.js"
import { measure } from "../../../src/util/TimeHelpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(async (t : TestBrowser) => {
    document.body.innerHTML = ''

    await t.moveMouseTo(0, 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const basicTestingScenario = (name : string, offset : ActionTargetOffset) => {

    it(name, async t => {

        t.beforeEach(() => {
            document.body.innerHTML =
                '<div style="position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;" id="target">' +
                    '<div style="position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;" id="marker"></div>' +
                '</div>'
        })


        t.it(`'mouseDown' should support offset for target`, async t => {
            t.firesOk('#marker', {
                'mouseenter'        : 1,
                'mouseleave'        : 0,
                'mousedown'         : 1
            })

            await t.mouseDown('#target', offset)
            await t.mouseUp()
        })

        t.it(`'mouseUp' should support offset for target`, async t => {
            t.firesOk('#marker', {
                'mouseenter'        : 1,
                'mouseleave'        : 0,
                'mouseup'           : 1
            })

            await t.mouseDown()
            await t.mouseUp('#target', offset)
        })

        t.it(`'click' should support offset for target`, async t => {
            t.firesOk('#marker', {
                'mouseenter'        : 1,
                'mouseleave'        : 0,
                'click'             : 1
            })

            await t.click('#target', offset)
        })

        t.it(`'rightClick' should support offset for target`, async t => {
            t.firesOk('#marker', {
                'mouseenter'        : 1,
                'mouseleave'        : 0,
                'contextmenu'       : 1
            })

            t.$('#marker').addEventListener('contextmenu', e => e.preventDefault())

            await t.rightClick('#target', offset)
        })

        t.it(`'doubleClick' should support offset for target`, async t => {
            t.firesOk('#marker', {
                'mouseenter'        : 1,
                'mouseleave'        : 0,
                'dblclick'          : 1
            })

            await t.doubleClick('#target', offset)
        })

        t.it(`'moveMouseTo' should support offset for target`, async t => {
            t.firesOk('#marker', {
                'mouseenter'        : 1,
                'mouseleave'        : 0,
                'mousemove'         : 1
            })

            await t.moveMouseTo('#target', offset)
        })
    })
}

basicTestingScenario('Plain numbers offset', [ 50, 50 ])
basicTestingScenario('Percentage-based offset expression', [ '50%', '50%' ])


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to move cursor to the element with offset, inside the element', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', 'click', 4)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, 0 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 50 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, '100% - 1' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 99 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100% - 1', '100% - 1' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 99, 99 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100% - 1', 0 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 99, 50 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to move cursor to the element with offset, outside the element', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', 'click', 0)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, -1 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 49 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ 0, '100%' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 50, 100 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100%', '100%' ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 100, 100 ])

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    await t.moveMouseTo('#box', [ '100%', 0 ])
    await t.click()

    t.equal(t.simulator.currentPosition, [ 100, 50 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`dragTo` should support fromOffset + toOffset', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;" id="from">' +
            '<div style="position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;" id="from_marker"></div>' +
        '</div>' +
        '<div style="position: absolute; left: 250px; top: 50px; width: 100px; height: 100px; background: blue;" id="to">' +
            '<div style="position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;" id="to_marker"></div>' +
        '</div>'

    t.firesOk('#from_marker', {
        'mouseenter'        : 1,
        'mouseleave'        : 1,
        'mousedown'         : 1
    })

    t.firesOk('#to_marker', {
        'mouseenter'        : 1,
        'mouseleave'        : 0,
        'mouseup'           : 1
    })

    await t.dragTo({ from : '#from', fromOffset : [ 50, 50 ], to : '#to', toOffset : [ 50, 50 ] })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`dragBy` should support fromOffset', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;" id="from">' +
            '<div style="position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;" id="from_marker"></div>' +
        '</div>'

    t.firesOk('#from_marker', {
        'mouseenter'        : 1,
        'mouseleave'        : 1,
        'mousedown'         : 1
    })

    await t.dragBy('#from', [ 100, 0 ], { fromOffset : [ 50, 50 ] })
})
