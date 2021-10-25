import { delay } from "../../../src/util/TimeHelpers.js"
import { isString } from "../../../src/util/Typeguards.js"
import { beforeEach, it } from "../../../browser.js"
import { createElement } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const logEvent = (
    el              : Element,
    eventNames      : string | string[],
    log             : string[],
    counter         : Record<string, Record<string, number>>,
    includeInLog    : boolean = true
) => {
    const id            = el.id
    const eventNamesArr = isString(eventNames) ? [ eventNames ] : eventNames

    eventNamesArr.forEach(eventName =>
        el.addEventListener(eventName, (event : MouseEvent) => {
            counter[ id ]               = counter[ id ] || {}
            counter[ id ][ eventName ]  = counter[ id ][ eventName ] || 0

            counter[ id ][ eventName ]++

            if (includeInLog) log.push(id + '/' + eventName + '/' + (event.relatedTarget ? (event.relatedTarget as Element).id : 'null'))
        })
    )
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should trigger `mouseover/mouseout/mouseenter/mouseleave/mousemove` events when moving mouse', async t => {
    const parent    = createElement({
        parent      : document.body,
        id          : 'parent',
        style       : 'margin: 100px; width: 200px; height: 200px; background: #ccc; position: relative;',
        children    : [
            {
                id      : 'child',
                style   : 'position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: #666;'
            }
        ]
    })

    const child         = t.$('#child')
    const body          = document.body

    body.id             = 'body'
    document.documentElement.id = 'html'

    const eventsLog     = []
    const counter : Record<string, Record<string, number>> = {}

    let bubbledToDoc    = false

    document.addEventListener('mousemove', () => bubbledToDoc = true)

    await t.moveMouseTo([ 200, 0 ])

    logEvent(body, [ 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ], eventsLog, counter)
    logEvent(body, 'mousemove', eventsLog, counter, false)

    logEvent(parent, [ 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ], eventsLog, counter)
    logEvent(parent, 'mousemove', eventsLog, counter, false)

    logEvent(child, [ 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ], eventsLog, counter)
    logEvent(child, 'mousemove', eventsLog, counter, false)

    //------------------------
    await t.moveMouseTo([ 200, 125 ])
    await t.moveMouseTo([ 200, 200 ])
    await t.moveMouseTo([ 200, 275 ])
    await t.moveMouseTo([ 200, 350 ])

    t.equal(counter.child, {
        mouseover       : 1,
        mouseout        : 1,
        mouseenter      : 1,
        mouseleave      : 1,
        mousemove       : t.any(Number)
    }, 'Correct events detected for child')

    t.equal(counter.parent, {
        mouseover       : 3,
        mouseout        : 3,
        mouseenter      : 1,
        mouseleave      : 1,
        mousemove       : t.any(Number)
    }, 'Correct events detected for parent')

    t.isGreater(counter.parent.mousemove, 0, "Mouse move fired for parent")
    t.isGreater(counter.child.mousemove, 0, "Mouse move fired for child")

    t.true(bubbledToDoc, '`mousemove` event bubbled up to document')

    t.equal(eventsLog, [
        "parent/mouseover/html",
        "body/mouseover/html",
        "body/mouseenter/html",
        "parent/mouseenter/html",
        "parent/mouseout/child",
        "body/mouseout/child",
        "child/mouseover/parent",
        "parent/mouseover/parent",
        "body/mouseover/parent",
        "child/mouseenter/parent",
        "child/mouseout/parent",
        "parent/mouseout/parent",
        "body/mouseout/parent",
        "child/mouseleave/parent",
        "parent/mouseover/child",
        "body/mouseover/child",
        "parent/mouseout/body",
        "body/mouseout/body",
        "parent/mouseleave/body",
        "body/mouseover/parent"
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Triggering `mouseenter/leave` events should work correctly', async t => {
    document.body.innerHTML =
        '<div id="outer" style="background: blue; position: absolute; width: 100px; height: 100px; left: 0; top: 0;">' +
            '<div id="inner" style="background: red; position: absolute; width: 50px; height: 50px; left: 25px; top: 25px">' +
                'Some text' +
            '</div>' +
        '</div>'

    await t.moveMouseTo([ 150, 50 ])

    t.firesOk('#outer', 'mouseenter', 1)
    t.firesOk('#outer', 'mouseleave', 0)
    t.firesOk('#inner', 'mouseenter', 1)
    t.firesOk('#inner', 'mouseleave', 0)

    await t.moveMouseTo([ 50, 50 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Triggering `mouseover` events should work for <span> elements', async t => {
    const parent        = createElement({
        parent      : document.body,
        id          : 'parent',
        style       : 'width: 200px; height: 200px; background: #ccc; margin: 20px;',
        html        : '<br><br><span id="child" style="background:#666;">Some wide content, yes, real wide</span>'
    })

    const child         = t.$('#child')

    const firedParent   = { mouseover : 0, mouseout : 0, mouseenter : 0, mouseleave : 0 }
    const firedChild    = { mouseover : 0, mouseout : 0, mouseenter : 0, mouseleave : 0 }

    await t.moveMouseTo('#parent', [ '50%', -10 ])

    parent.addEventListener('mouseover', () => firedParent.mouseover++)
    parent.addEventListener('mouseout', () => firedParent.mouseout++)
    parent.addEventListener('mouseenter', () => firedParent.mouseenter++)
    parent.addEventListener('mouseleave', () => firedParent.mouseleave++)

    child.addEventListener('mouseover', () => firedChild.mouseover++)
    child.addEventListener('mouseout', () => firedChild.mouseout++)
    child.addEventListener('mouseenter', () => firedChild.mouseenter++)
    child.addEventListener('mouseleave', () => firedChild.mouseleave++)

    await t.moveMouseTo('#parent', [ '50%', 1 ])

    await t.moveMouseTo('#child', [ '50%', 1 ])

    await t.moveMouseTo('#child', [ '50%', '100% + 10' ])

    await t.moveMouseTo('#parent', [ '50%', '100% + 10' ])

    t.equal(firedChild, { mouseover : 1, mouseout : 1, mouseenter : 1, mouseleave : 1 }, 'Correct events detected for child')
    t.equal(firedParent, { mouseover : 3, mouseout : 3, mouseenter : 1, mouseleave : 1 }, 'Correct events detected for parent')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it("After mouse interactions, the target el must be re-evaluated", async t => {
    document.body.innerHTML =
        '<div style="position: absolute; left: 5px; top: 5px; border: 1px solid black; width: 50px; height: 50px" id="outer">' +
            '<div style="background: #aaa; position: absolute; top: 0; left: 0; width: 40px; height: 40px" id="inner">' +
            '</div>' +
        '</div>'

    const inner     = document.getElementById('inner')
    const outer     = document.getElementById('outer')

    outer.addEventListener('click', () => inner.style.display = 'none')

    await t.moveMouseTo('#outer')

    const innerWait     = t.waitForEvent(inner, 'mouseleave')
    const outerWait     = t.waitForEvent(outer, 'mouseover')

    // this click hides the `#inner` element, so it should trigger `mouseleave`
    // the cursor then becomes positioned on the `#outer`, which should trigger `mouseover`
    await t.click([])

    // the events above are triggered in the next tick, so need to wait a bit
    await Promise.all([ innerWait, outerWait ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it("mouseenter should be fired for underlying (usually parent) elements too", async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 0; left: 50px; border: 1px solid black; width: 50px; height: 50px" id="outer1">' +
            '<div style="background: #aaa; position: absolute; top: 0; left: 0; width: 40px; height: 40px" id="inner1">' +
            '</div>' +
        '</div>'

    const inner = document.getElementById('inner1')
    const outer = document.getElementById('outer1')

    await t.moveMouseTo([ 0, 0 ])

    t.firesOnce(outer, 'mouseenter', 'outer mouseenter')
    t.firesOnce(inner, 'mouseenter', 'inner mouseenter')

    await t.moveMouseTo('#inner1')
})


