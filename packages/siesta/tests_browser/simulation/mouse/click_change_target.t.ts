import { it } from "../../../browser.js"
import { delay } from "../../../src/util/TimeHelpers.js"
import { awaitDomInteractive } from "../../../src/util_browser/Dom.js"
import { createElement } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

let log : string[]
let box1 : HTMLElement, box2 : HTMLElement, box3 : HTMLElement

const setupBox = id => {
    const el            = document.getElementById(id)

    const handler       = (e : MouseEvent) => log.push(e.type + "/" + id)

    el.addEventListener('mousedown', handler)
    el.addEventListener('mouseup', handler)
    el.addEventListener('click', handler)
    el.addEventListener('contextmenu', handler)
    el.addEventListener('dblclick', handler)

    return el
}


const doSetup     = () => {
    document.body.innerHTML =
        '<div class="box" id="box1" style="left: 0px;top:0px"></div>' +
        '<div class="box" id="box2" style="border-color:blue; left: 300px;top:0px"></div>' +
        '<div class="box" id="box3" style="border-color:red; left: 600px;top:0px"></div>'

    box1    = setupBox('box1')
    box2    = setupBox('box2')
    box3    = setupBox('box3')

    log     = []
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Changing the target should cancel the `click` event', async t => {
    doSetup()

    box1.addEventListener('mousedown', e => box2.style.left = '50px')

    await t.click('#box1')

    t.equal(log, [
        'mousedown/box1',
        'mouseup/box2'
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Changing the target to the child el should not cancel the `click` event', async t => {
    document.body.innerHTML =
        '<div class="box" id="box1" style="left: 0px;top:0px; height: 100px; width:100px">' +
            '<div class="box" id="box2" style="border-color:blue; left: 0px;top:0px; height: 50px; width:50px"></div>' +
        '</div>'


    box1    = setupBox('box1')
    box2    = setupBox('box2')

    log     = []

    box1.addEventListener('mousedown', e => box2.style.width = '0px')

    await t.click('#box2')

    t.equal(log, [
        'mousedown/box2',
        'mousedown/box1',
        'mouseup/box1',
        'click/box1'
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Changing the target should cancel the `click` event but not the 2nd one in the dblclick', async t => {
    doSetup()

    box1.addEventListener('mousedown', e => box2.style.left = '50px')

    await t.doubleClick('#box1')

    t.equal(log, [
        'mousedown/box1',
        'mouseup/box2',
        'mousedown/box2',
        'mouseup/box2',
        'click/box2',
        'dblclick/box2'
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Changing the target in the 2nd phase of dblclick should still cancel the `click` and `dblclick`', async t => {
    doSetup()

    box1.addEventListener('mousedown', e => box2.style.left = '50px')

    box2.addEventListener('mousedown', e => box3.style.left = '100px')

    await t.doubleClick('#box1', [ '90%', '50%' ])

    t.equal(log, [
        'mousedown/box1',
        'mouseup/box2',
        'mousedown/box2',
        'mouseup/box3'
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire click event on common ancestor of pointerup element + element-at-cursor if pointerup triggers another element to become visible', async t => {
    document.body.innerHTML =
        '<div id="outer" style="position: absolute; left: 0; top: 0; height: 250px; width: 250px; background: red;">' +
            '<div id="inner" style="background: blue;">Inner Element' +
                '<div id="inner-inner" style="background: #fff; width: 100px">Innermost Element</div>' +
            '</div>' +
        '</div>'

    const outer = t.$('#outer') as HTMLElement
    const inner = t.$('#inner') as HTMLElement

    outer.addEventListener('pointerdown', e => {
        // Now element is not reachable with elementFromPoint
        inner.style.visibility = 'hidden'
        e.preventDefault()
    })

    outer.addEventListener('pointerup', e => {
        inner.style.visibility = 'visible'
    })

    t.wontFire(inner, [ 'mouseup', 'click' ], 'inner should not trigger mouseup and click events')

    t.wontFire(outer, 'mouseup', 'outer should not trigger mouseup')

    // if (t.bowser.gecko || (t.bowser.safari && this.bowser.version >= 13)) {
    //     t.wontFire(outer, 'click', 'outer should not trigger click in Safari/FF')
    // } else {
    t.firesOnce(outer, 'click', 'outer should trigger click in Chrome/IE')
    // }

    await t.click(inner)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it("After mousedown, we should fire mouseleave if target moved", async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 0; left: 10px; border: 1px solid black; width: 10px; height: 10px" id="outer"></div>'

    const outer         = document.getElementById('outer')

    outer.addEventListener('mousedown', () => outer.style.left = '20px')

    await t.waitForEvent('#outer', 'mouseleave', { trigger : () => t.click('#outer') })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it("After mouseup, we should fire mouseleave if target moved", async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 10px; left: 10px; border: 1px solid black; width: 10px; height: 10px" id="outer"></div>'

    const outer         = document.getElementById('outer')

    outer.addEventListener('mouseup', () => outer.style.left = '20px')

    await t.waitForEvent('#outer', 'mouseleave', { trigger : () => t.click('#outer') })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it("After click, we should fire mouseleave if target moved", async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 10px; left: 10px; border: 1px solid black; width: 10px; height: 10px" id="outer"></div>'

    const outer         = document.getElementById('outer')

    outer.addEventListener('click', () => outer.style.left = '20px')

    await t.waitForEvent('#outer', 'mouseleave', { trigger : () => t.click('#outer') })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it("should fire mouseleave if target was removed from DOM after mouseup", async t => {
    await t.moveMouseTo([ 0, 0 ])

    document.body.innerHTML =
        '<div style="position: absolute; top: 0; left: 10px; border: 1px solid black; width: 10px; height: 10px" id="outer"></div>'

    const outer         = document.getElementById('outer')

    outer.addEventListener('mouseup', () => outer.remove())

    t.willFireNTimes(outer, 'mouseenter', 1, 'outer mouseenter')
    t.willFireNTimes(outer, 'mouseout', 0, 'outer mouseout not fired')
    t.willFireNTimes(outer, 'mouseleave', 0, 'outer mouseleave')

    // 1 mouseover is 'outer' bubbling
    // 1 mouseover is when 'outer' is removed
    t.willFireNTimes(document.body, 'mouseover', 2, 'body mouseover')

    await t.click(outer)

    await delay(10)
})
