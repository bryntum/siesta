import { beforeEach, it } from "../../../browser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`dragTo` method should work', async t => {
    document.body.innerHTML =
        '<div id="div" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;">div</div>'

    const div   = t.$('#div') as HTMLElement

    div.addEventListener('mousedown', e => {
        t.is(e.clientX, 20, 'Correct X')
        t.is(e.clientY, 30, 'Correct Y')
    })

    div.addEventListener('mouseup', e => {
        t.is(e.clientX, 30, 'Correct X')
        t.is(e.clientY, 40, 'Correct Y')
    })

    div.addEventListener('click', e => {
        t.is(e.clientX, 30, 'Correct X')
        t.is(e.clientY, 40, 'Correct Y')
    })

    t.firesOnce(div, [ 'mousedown', 'mouseup', 'click' ])

    await t.dragTo({
        source          : '#div',
        sourceOffset    : [ 20, 30 ],
        target          : document.body,
        targetOffset    : [ 30, 40 ],
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // native FF does fire click in this case
// if (!(t.bowser.firefox && t.simulator.type == 'native'))
it('Drag should NOT fire click event if `mouseup` moves target to another parent', async t => {
    document.body.innerHTML =
        '<div id="newcontainer" style="position: absolute; left: 0; top: 0; height: 50px; width: 100px; background: #aaa;"></div>' +
        '<div id="div" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;">div</div>'

    const div = t.$('#div') as HTMLElement

    let mouseMovelistener, mouseUplistener

    div.addEventListener('mousedown', e => {
        document.body.addEventListener('mousemove', mouseMovelistener = e => {
            div.style.left = (e.clientX - 25) + 'px'
        })

        document.body.addEventListener('mouseup', mouseUplistener = e => {
            document.getElementById('newcontainer').appendChild(div)

            document.body.removeEventListener('mousemove', mouseMovelistener)
            document.body.removeEventListener('mouseup', mouseUplistener)
        })
    })

    t.firesOnce(div, [ 'mousedown', 'mouseup' ])

    t.wontFire(div, 'click')
    t.wontFire(document.body, 'click')

    await t.dragBy(div, [ 20, 0 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('drag should fire click event on closest parent element if mouseup is on another element', async t => {
    document.body.innerHTML =
        '<div id="container" style="position: absolute; left: 0; top: 0; height: 50px; width: 100px; background: #aaa;">' +
            '<div id="div1" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;"></div>' +
            '<div id="div2" style="position: absolute; left: 50px; top: 0; height: 50px; width: 50px; background: blue;"></div>' +
        '</div>'

    const div1      = t.$('#div1')
    const div2      = t.$('#div2')
    const container = t.$('#container')

    let containerClicked = false

    t.firesOnce(div2, 'mousedown')
    t.firesOnce(div1, 'mouseup')
    t.wontFire(div1, 'click')
    t.wontFire(div2, 'click')

    container.addEventListener('click', () => containerClicked = true)

    await t.dragTo(div2, div1)

    t.is(containerClicked, /*BR.gecko || BR.safari ? false :*/ true, 'Chrome + IE drag should fire click event on common ancestor node of targets of mousedown/mouseup actions')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('drag should NOT fire click event if mousedown removes the node from DOM', async t => {
    document.body.innerHTML =
        '<div id="div" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;">div</div>'

    const div = t.$('#div')

    div.addEventListener('mousedown', e => div.remove())

    t.firesOk(document.body, { 'mouseup' : 1, 'click' : 0 })

    t.firesOk(div, { 'mousedown' : 1, 'mouseup' : 0, 'click' : 0 })

    await t.dragBy(div, [ 20, 0 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('drag should NOT fire click event if mouseup removes the node from DOM', async t => {
    document.body.innerHTML =
        '<div id="div" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;">div</div>'

    const div = t.$('#div') as HTMLElement

    let mouseMovelistener, mouseUplistener, mouseDownlistener

    div.addEventListener('mousedown', mouseDownlistener = e => {
        document.body.addEventListener('mousemove', mouseMovelistener = e => {
            div.style.left = (e.clientX - 25) + 'px'
        })

        document.body.addEventListener('mouseup', mouseUplistener = e => {
            document.body.removeChild(div)

            document.body.removeEventListener('mousemove', mouseMovelistener)
            document.body.removeEventListener('mouseup', mouseUplistener)
            div.removeEventListener('mousedown', mouseDownlistener)
        })
    })

    t.firesOnce(div, [ 'mousedown', 'mouseup' ])
    t.wontFire(div, 'click')
    t.wontFire(document.body, 'click')

    await t.dragBy(div, [ 20, 0 ])
})
