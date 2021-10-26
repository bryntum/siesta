import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `click` method', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', { mousedown : 1, mouseup : 1, click : 1 });

    [ 'mousedown', 'mouseup', 'click' ].forEach(eventName => {
        t.$('#box').addEventListener(eventName, (e : MouseEvent) => {
            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    await t.click({ target : '#box', shiftKey : true, altKey : true, ctrlKey : true, metaKey : true })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `rightClick` method', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', { mousedown : 1, mouseup : 1, contextmenu : 1 });

    [ 'mousedown', 'mouseup', 'contextmenu' ].forEach(eventName => {
        t.$('#box').addEventListener(eventName, (e : MouseEvent) => {
            e.preventDefault()

            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            // t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    // https://bugzilla.mozilla.org/show_bug.cgi?id=692139#c6
    await t.rightClick({ target : '#box', /*shiftKey : true,*/ altKey : true, ctrlKey : true, metaKey : true })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `doubleClick` method', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    t.firesOk('#box', { mousedown : 2, mouseup : 2, click : 2, dblclick : 1 });

    [ 'mousedown', 'mouseup', 'click', 'dblclick' ].forEach(eventName => {
        t.$('#box').addEventListener(eventName, (e : MouseEvent) => {
            e.preventDefault()

            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    await t.doubleClick({ target : '#box', shiftKey : true, altKey : true, ctrlKey : true, metaKey : true })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `moveMouseTo` method', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    await t.moveMouseTo('#box', [ -1, '50%' ])

    await t.mouseDown()

    t.firesOk('#box', { mousemove : '>=1', mouseover : 1, mouseout : 1, mouseenter : 1, mouseleave : 1 });

    [ 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ].forEach(eventName => {
        t.$('#box').addEventListener(eventName, (e : MouseEvent) => {
            if (t.isFinished) return

            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    await t.moveMouseTo({ target : '#box', shiftKey : true, altKey : true, ctrlKey : true, metaKey : true })

    await t.moveMouseTo({ target : '#box', offset : [ '100% + 1', '50%' ], shiftKey : true, altKey : true, ctrlKey : true, metaKey : true })

    await t.mouseUp()
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `moveMouseBy` method', async t => {
    document.body.innerHTML = '<div id="box" style="position: absolute; left : 50px; top: 50px; width: 50px; height: 50px; background: #ccc;"></div>'

    await t.moveMouseTo('#box', [ -1, '50%' ])

    await t.mouseDown()

    t.firesOk('#box', { mousemove : '>=1', mouseover : 1, mouseout : 1, mouseenter : 1, mouseleave : 1 });

    [ 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave' ].forEach(eventName => {
        t.$('#box').addEventListener(eventName, (e : MouseEvent) => {
            if (t.isFinished) return

            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    await t.moveMouseBy(30, 0, { shiftKey : true, altKey : true, ctrlKey : true, metaKey : true })

    await t.moveMouseBy(30, 0, { shiftKey : true, altKey : true, ctrlKey : true, metaKey : true })

    await t.mouseUp()
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `dragTo` method', async t => {
    document.body.innerHTML =
        '<div id="div" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;">div</div>'

    const div   = t.$('#div') as HTMLElement

    await t.moveMouseTo(div, [ 1, 1 ]);

    [ 'mousedown', 'mouseup', 'click', 'mousemove', 'mouseover', 'mouseout' ].forEach(eventName => {
        div.addEventListener(eventName, (e : MouseEvent) => {
            if (t.isFinished) return

            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    await t.dragTo({
        source          : '#div',
        sourceOffset    : [ 20, 30 ],
        target          : document.body,
        targetOffset    : [ 30, 40 ],

        shiftKey        : true,
        altKey          : true,
        ctrlKey         : true,
        metaKey         : true
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support passing modifier keys to `dragBy` method', async t => {
    document.body.innerHTML =
        '<div id="div" style="position: absolute; left: 0; top: 0; height: 50px; width: 50px; background: red;">div</div>'

    const div   = t.$('#div') as HTMLElement

    await t.moveMouseTo(div, [ 1, 1 ]);

    [ 'mousedown', 'mouseup', 'click', 'mousemove', 'mouseover', 'mouseout' ].forEach(eventName => {
        div.addEventListener(eventName, (e : MouseEvent) => {
            if (t.isFinished) return

            t.silent.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.silent.true(e.shiftKey, e.type + ': Shift key detected')
            t.silent.true(e.altKey, e.type + ': Alt key detected')
            t.silent.true(e.metaKey, e.type + ': Meta key detected')
        })
    })

    await t.dragBy('#div', [ 10, 10 ], {
        shiftKey        : true,
        altKey          : true,
        ctrlKey         : true,
        metaKey         : true
    })
})
