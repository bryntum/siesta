import { beforeEach, it, TestBrowser } from "../../../browser.js"
import { delay, measure } from "../../../src/util/TimeHelpers.js"
import { createPositionedElement } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(async (t : TestBrowser) => {
    document.body.innerHTML = ''

    await t.moveMouseTo(0, 0)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const defaultDelay  = 50

const delayedDivCreation = (delay : number = defaultDelay) : HTMLElement => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    div.style.backgroundColor = 'green'
    div.id          = 'delayed'

    setTimeout(() => document.body.appendChild(div), delay)

    return div
}

const delayedDisplayStyle = (delay : number = defaultDelay) : HTMLElement => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    div.style.backgroundColor   = 'green'
    div.style.display           = 'none'
    div.id                      = 'delayed'

    document.body.appendChild(div)

    setTimeout(() => div.style.display = 'block', delay)

    return div
}

const delayedVisibilityStyle = (delay : number = defaultDelay) : HTMLElement => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    div.style.backgroundColor   = 'green'
    div.style.visibility        = 'hidden'
    div.id                      = 'delayed'

    document.body.appendChild(div)

    setTimeout(() => div.style.visibility = 'visible', delay)

    return div
}

const delayedSize = (delay : number = defaultDelay) : HTMLElement => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 0, height : 0 })

    div.style.backgroundColor   = 'green'
    div.id                      = 'delayed'

    document.body.appendChild(div)

    setTimeout(() => {
        div.style.width     = '100px'
        div.style.height    = '100px'
    }, delay)

    return div
}

const delayedReachability = (delay : number = defaultDelay) : HTMLElement => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    div.style.backgroundColor   = 'green'
    div.id                      = 'delayed'
    div.style.zIndex            = '100'

    const mask       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })
    mask.style.backgroundColor  = 'blue'
    mask.style.zIndex           = '1000'

    document.body.appendChild(div)
    document.body.appendChild(mask)

    setTimeout(() => mask.remove(), delay)

    return div
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const basicTestingScenarios = (
    name                : string,
    createDelayedDiv    : (delay? : number) => HTMLElement,
    skipMouseMove       : boolean = false
) => {

    it(name, async t => {
        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`mouseDown` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.firesOnce(div, 'mousedown')

            const { elapsed } = await measure(t.mouseDown('#delayed'))

            t.isGreaterOrEqual(elapsed, defaultDelay)

            await t.mouseUp()
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`mouseUp` should await for target to become actionable', async t => {
            await t.mouseDown()

            const div = createDelayedDiv()

            t.firesOnce(div, 'mouseup')

            const { elapsed } = await measure(t.mouseUp('#delayed'))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        !skipMouseMove && t.it('`moveMouseTo` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.waitForEvent(div, 'mouseenter')

            const { elapsed } = await measure(t.moveMouseTo('#delayed'))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`click` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.firesOnce(div, 'click')

            const { elapsed } = await measure(t.click('#delayed'))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`rightClick` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.firesOnce(div, 'contextmenu')

            div.addEventListener('contextmenu', e => e.preventDefault())

            const { elapsed } = await measure(t.rightClick('#delayed'))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`doubleClick` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.firesOnce(div, 'dblclick')

            const { elapsed } = await measure(t.doubleClick('#delayed'))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`dragTo` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.firesOnce(div, 'mousedown')

            const { elapsed } = await measure(t.dragTo('#delayed', [ 300, 300 ]))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        t.it('`dragBy` should await for target to become actionable', async t => {
            const div = createDelayedDiv()

            t.firesOnce(div, 'mousedown')

            const { elapsed } = await measure(t.dragBy('#delayed', [ 100, 100 ]))

            t.isGreaterOrEqual(elapsed, defaultDelay)
        })
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
basicTestingScenarios('Delayed creation', delayedDivCreation)
basicTestingScenarios('Delayed display style', delayedDisplayStyle)
basicTestingScenarios('Delayed visibility style', delayedVisibilityStyle)
basicTestingScenarios('Delayed size', delayedSize)
basicTestingScenarios('Delayed reachability', delayedReachability, true)


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`moveMouseTo` should NOT await for target to become reachable', async t => {
    const div       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    div.style.backgroundColor   = 'green'
    div.id                      = 'delayed'
    div.style.zIndex            = '100'

    const mask       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })
    mask.style.backgroundColor  = 'blue'
    mask.style.zIndex           = '1000'

    document.body.appendChild(div)
    document.body.appendChild(mask)

    await t.moveMouseTo('#delayed')

    t.not.isElementPointReachable(div)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`dragTo` method  should wait for target', async t => {
    const source       = createPositionedElement('div', { left : 50, top : 50, width : 100, height : 100 })

    source.style.backgroundColor    = 'green'
    source.id                       = 'source'

    document.body.appendChild(source)

    setTimeout(() => {
        const target       = createPositionedElement('div', { left : 250, top : 50, width : 100, height : 100 })
        target.id                       = 'target'
        target.style.backgroundColor    = 'blue'

        document.body.appendChild(target)

        t.firesOnce('#target', 'mouseup')
    }, defaultDelay)

    t.firesOnce('#source', 'mousedown')

    const { elapsed } = await measure(t.dragTo('#source', '#target'))

    t.isGreaterOrEqual(elapsed, defaultDelay)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Stress test: should handle moving targets', async t => {
    const target      = createPositionedElement('div', { left : 0, top : 0, width : 50, height : 50 })

    target.style.backgroundColor    = 'green'
    target.id                       = 'target'

    document.body.appendChild(target)

    const positions = [
        [ 0, 0 ],
        [ 500, 0 ],
        [ 500, 500 ],
        [ 0, 500 ],
        [ 0, 0 ]
    ]

    // Move the cursor away so it takes a bit of time to reach the button initially
    await t.moveMouseTo(600, 600)

    t.willFireNTimes(target, 'click', 1)

    t.click('#target', { mouseMovePrecision : 1 })

    for (const position of positions) {
        target.style.left   = position[ 0 ] + 'px'
        target.style.top    = position[ 1 ] + 'px'

        await delay(300)
    }
})
