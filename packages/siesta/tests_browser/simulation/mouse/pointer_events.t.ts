import { it } from "../../../browser.js"
import { awaitDomInteractive } from "../../../src/util_browser/Dom.js"
import { createElement } from "../../@helpers.js"

awaitDomInteractive().then(() =>
    createElement('style', {
        html :
`.box {                
    position    : absolute;
    width       : 200px;
    height      : 200px;
    border      : 1px solid green;
}
`,
        parent  : document.head
    })
)

let log : string[], box1 : HTMLElement, box2 : HTMLElement, box3 : HTMLElement, counter : Record<string, Record<string, number>>


const logHandler    = (e : PointerEvent) => log.push(`${ e.type }/${ (e.target as Element).id }`)


const countHandler  = (e : PointerEvent) => {
    const id        = (e.target as Element).id
    const type      = e.type

    if (!counter[ id ]) counter[ id ] = {}

    const perElCounts = counter[ id ]

    perElCounts[ type ]   = perElCounts[ type ] || 0
    perElCounts[ type ]++
}


const setupBox = (id : string) : HTMLElement => {
    const el            = document.getElementById(id)

    el.addEventListener('pointerdown', logHandler)
    el.addEventListener('mousedown', logHandler)

    el.addEventListener('pointerup', logHandler)
    el.addEventListener('mouseup', logHandler)

    el.addEventListener('click', logHandler)
    el.addEventListener('contextmenu', logHandler)
    el.addEventListener('dblclick', logHandler)

    return el
}

const setupBoxForPointerMove = (id : string, withMoveCounting : boolean = false) : HTMLElement => {
    let el              = document.getElementById(id)

    el.addEventListener('pointerover', logHandler)
    el.addEventListener('mouseover', logHandler)

    el.addEventListener('pointerenter', logHandler)
    el.addEventListener('mouseenter', logHandler)

    el.addEventListener('pointerout', logHandler)
    el.addEventListener('mouseout', logHandler)

    el.addEventListener('pointerleave', logHandler)
    el.addEventListener('mouseleave', logHandler)

    if (withMoveCounting) {
        el.addEventListener('pointermove', countHandler)
        el.addEventListener('mousemove', countHandler)
    }

    return el
}

const doSetup     = function () {
    document.body.innerHTML =
        '<div class="box" id="box1" style="left: 0px;top:0px"></div>' +
        '<div class="box" id="box2" style="border-color:blue; left: 300px;top:0px"></div>' +
        '<div class="box" id="box3" style="border-color:red; left: 600px;top:0px"></div>'

    box1    = setupBox('box1')
    box2    = setupBox('box2')
    box3    = setupBox('box3')

    log     = []
    counter = {}
}


it('Should fire pointer events for click', async t => {
    doSetup()

    await t.click('#box1')

    t.equal(log, [
        'pointerdown/box1',
        'mousedown/box1',
        'pointerup/box1',
        'mouseup/box1',
        'click/box1'
    ])
})


it('Preventing the `pointerdown` should skip mouse events from firing', async t => {
    doSetup()

    box1.addEventListener('pointerdown', e => e.preventDefault())

    await t.click('#box1')

    t.equal(log, [
        'pointerdown/box1',
        'pointerup/box1',
        'click/box1'
    ])
})


it('Preventing the `pointerdown` should skip `mouse` events from firing when dragging', async t => {
    doSetup()

    box1.addEventListener('pointerdown', e => e.preventDefault())

    await t.dragBy('#box1', [ 10, 10 ])

    t.equal(log, [
        'pointerdown/box1',
        'pointerup/box1',
        'click/box1'
    ])
})


it('Should fire pointer events for mouse movements', async t => {
    doSetup()

    await t.moveMouseTo('#box1', [ '100% + 10', '50%' ])

    setupBoxForPointerMove('box1', true)

    await t.moveMouseBy([ -20, 0 ])
    await t.moveMouseBy([ 20, 0 ])

    t.equal(log, [
        "pointerover/box1",
        "pointerenter/box1",
        "mouseover/box1",
        "mouseenter/box1",
        "pointerout/box1",
        "pointerleave/box1",
        "mouseout/box1",
        "mouseleave/box1"
    ])

    t.isGreater(counter.box1.pointermove, 0)
})
