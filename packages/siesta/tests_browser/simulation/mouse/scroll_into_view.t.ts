import { beforeEach, it } from "../../../browser.js"

// the default style `height: 100%` limits the size of the body
document.body.style.height = ''


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Mouse action should work if page is scrolled', async t => {
    beforeEach(() => {
        document.body.innerHTML =
            '<div style="position: relative; width: 10px; height: 2500px; background: blue;">scroller</div>' +
            '<div id="clicker" style="position: absolute; left: 100px; top: 1100px; width: 50px; height: 200px; background: red;"></div>'

        document.scrollingElement.scrollTop = 1000
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    it('Click on element should work correctly when page is scrolled', async t => {
        t.firesOnce('#clicker', 'click')

        await t.click('#clicker')
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    it('Click on coordinates should work correctly when page is scrolled', async t => {
        t.firesOnce('#clicker', 'click')

        await t.click([ 110, 110 ])
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    it('`getElementAtCursor`', async t => {
        await t.moveMouseTo('#clicker')

        t.is(t.getElementAtCursor(), t.$('#clicker'))
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    it('`Move mouse to - need to scroll target point into view`', async t => {
        document.scrollingElement.scrollTop = 0

        t.firesOnce('#clicker', 'click')

        await t.click('#clicker')
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    it('`Drag from coordinates should work correctly when page is scrolled`', async t => {
        t.firesOnce('#clicker', 'mousedown')
        t.firesOnce(document.body, 'mouseup')

        await t.dragBy([ 110, 110 ], [ 50, 50 ])
    })


    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
    it('`Drag from el to other el`', async t => {
        t.firesOnce('#clicker', 'mousedown')
        t.firesOnce(document.body, 'mouseup')

        await t.dragTo({
            source          : '#clicker',
            target          : document.body,
            targetOffset    : [ 160, 1250 ]
        })
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should scroll element into view 1', async t => {
    setTimeout(() => {
        document.body.innerHTML =
            '<div style="border: 1px solid #ddd; width: 200px; height: 200px; overflow: auto">' +
                '<div style="background: #aaa; margin-top: 240px; width: 40px; height: 40px" id="inner">FOO</div>' +
            '</div>'

        t.willFireNTimes("#inner", 'click', 1)
    }, 200)

    await t.click('#inner')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should scroll element into view 2', async t => {
    document.body.innerHTML =
        '<div style="border: 1px solid #ddd; width: 200px; height: 150px; overflow: auto">' +
            '<div style="background: #aaa; margin-top: 160px; width: 40px; height: 100px">' +
                '<div id="inner2" style="height: 40px; width: 40px; background: #666">FOO</div>' +
            '</div>' +
        '</div>'

    t.willFireNTimes("#inner2", 'click', 1)

    await t.click('#inner2')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should scroll element into view 1', async t => {
    document.body.innerHTML =
        '<div style="margin: 20px; border: 1px solid #ddd; width: 200px; height: 200px; overflow: auto">' +
            '<div style="background: #aaa; margin-top: 240px; width: 40px; height: 40px" id="inner">FOO</div>' +
        '</div>'

    await t.dragBy('#inner', [ 10, 10 ])

    t.elementPointIsReachable('#inner', "Element has been scrolled into view")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should scroll element into view 2', async t => {
    document.body.innerHTML =
        '<div style="margin: 20px; border: 1px solid #ddd; width: 200px; height: 200px; overflow: auto">' +
            '<div style="background: #aaa; margin-top: 240px; width: 40px; height: 40px" id="inner">FOO</div>' +
        '</div>'

    await t.dragTo({ source : '#inner', target : '#inner', targetOffset : [ '100% + 50', '50%' ] })

    t.elementPointIsReachable('#inner', "Element has been scrolled into view")
})



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should scroll element into view 3', async t => {
    document.body.innerHTML =
        '<div style="margin: 20px; border: 1px solid #ddd; width: 200px; height: 150px; overflow: auto">' +
            '<div style="background: #aaa; margin-top: 160px; width: 40px; height: 100px">' +
                '<div id="inner2" style="height: 40px; width: 40px; background: #666">FOO</div>' +
            '</div>' +
        '</div>'

    await t.dragBy('#inner2', [ 10, 10 ])

    t.elementPointIsReachable('#inner2', "Element has been scrolled into view")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should scroll element into view 4', async t => {
    document.body.innerHTML =
        '<div style="margin: 20px; border: 1px solid #ddd; width: 200px; height: 150px; overflow: auto">' +
            '<div style="background: #aaa; margin-top: 160px; width: 40px; height: 100px">' +
                '<div id="inner2" style="height: 40px; width: 40px; background: #666">FOO</div>' +
            '</div>' +
        '</div>'

    await t.dragTo({ source : '#inner2', target : '#inner2', targetOffset : [ '100% + 50', '50%' ] })

    t.elementPointIsReachable('#inner2', "Element has been scrolled into view")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Click should not trigger scroll on any parent, if target is already visible', async t => {
    document.body.innerHTML =
        '<div id="cont" style="width: 100px; height: 400px; background: #333; overflow: scroll">' +
            '<div style="width: 80px; height: 1000px; background: #888;">' +
                '<div id="div" style="width: 50px; height: 150px; background: #444"></div>' +
            '</div>' +
        '</div>'

    const scrolledContainer = document.getElementById('cont')

    scrolledContainer.scrollTop = 100

    t.firesOnce('#div', 'mousedown')

    await t.mouseDown('#div', [ 30, 140 ])

    t.expect(scrolledContainer.scrollTop).toBe(100)
})
