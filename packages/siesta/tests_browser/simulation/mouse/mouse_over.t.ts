import { isString } from "../../../src/util/Typeguards.js"
import { it } from "../../../browser.js"
import { createElement } from "../../@helpers.js"

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

    // no "mouseenter/leave" events except the IE
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

