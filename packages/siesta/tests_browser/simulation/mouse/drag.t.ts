import { beforeEach, iit, it } from "../../../browser.js"


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

    // native FF does fire click in this case
    t.firesOk(div, 'click', t.env.browser === 'firefox' ? 1 : 0)
    t.firesOk(document.body, 'click', t.env.browser === 'firefox' ? 1 : 0)

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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire mouseleave if target moved after drag -> mouseup', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 0; left: 50px; border: 1px solid black; width: 100px; height: 100px" id="outer"></div>'

    await t.moveMouseTo(1, 1)

    const outer = document.getElementById('outer')

    outer.addEventListener('mouseup', () => outer.style.left = '200px')

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    let mouseLeaveCounter = 0

    outer.addEventListener('mouseleave', () => mouseLeaveCounter++)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    let mouseOverCounter    = 0

    document.body.addEventListener('mouseover', () => mouseOverCounter++)

    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    t.firesOk(outer, 'mouseenter', 1, 'outer mouseenter')
    t.firesOk(outer, 'mouseleave', /*isNativeFF ? 0 :*/ 1, 'outer mouseleave')

    // NOTE: Firefox doesn't fire mouseover after the DIV is moved, Chrome does
    // 1 mouseover is 'outer' bubbling
    // 1 mouseover is when 'outer' is removed
    t.firesOk(document.body, 'mouseover', /*isNativeFF ? 1 :*/ 2, 'body mouseover')

    // the events from above are fired asynchronously, already after the mouseup is complete
    // there's no reliable way to wait for both of them, except explicit `waitFor` custom condition
    await t.waitFor({
        condition   : () => mouseLeaveCounter === 1 && mouseOverCounter === 2,
        trigger     : () => t.dragTo([], '#outer')
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should fire mouseout/mouseover when dragging target that hides on mousedown and reappears after mouseup', async t => {
    document.body.innerHTML =
        '<div style="position: absolute; top: 0; left: 100px; border: 1px solid black; width: 100px; height: 100px;" id="outer">' +
            '<div style="position: absolute; top: 40px; left: 40px; border: 1px solid green; width: 40px; height: 40px;" id="inner">' +
                '<div style="margin: 5px; background: red; width: 80%; height: 80%" id="inner-content">' +
                '</div>' +
            '</div>' +
        '</div>'

    await t.moveMouseTo(1, 1)

    const inner         = t.$('#inner') as HTMLElement
    const outer         = t.$('#outer') as HTMLElement
    const innerContent  = t.$('#inner-content') as HTMLElement

    inner.addEventListener('mousedown', () => {
        // if (t.bowser.linux)
        //     inner.style.display = 'none'
        // else
            inner.style.visibility = 'hidden'
    })

    document.body.addEventListener('mouseup', e => {
        // if (t.bowser.linux)
        //     inner.style.display = 'block'
        // else
            inner.style.visibility = ''
    })


    t.willFireNTimes(innerContent, 'mouseout', 1, 'inner is mouseout')

    await t.dragBy('#inner', [ 5, 0 ], { dragOnly : true })

    const waitForMouseout       = t.waitForEvent(outer, 'mouseout')
    const waitForMouseover      = t.waitForEvent(inner, 'mouseover')

    await t.mouseUp()

    await Promise.all([ waitForMouseout, waitForMouseover ])
})
