import { beforeEach, it, describe } from "../../../browser.js"
import { isElementPointReachable, isElementPointVisible } from "../../../src/util_browser/Dom.js"
import { scrollElementPointIntoView } from "../../../src/util_browser/Scroll.js"

beforeEach(() => {
    document.body.innerHTML = ''
})


it('Should be able to scroll element point into view, from right', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: scroll">' +
            '<div id="inner" style="position: absolute; left: 150px; top: 150px; width:100px; height: 100px; background: red"></div>' +
        '</div>'

    const scrollable    = t.$('#scrollable')
    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    debugger

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})


it('Should be able to scroll element point into view, from left', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: scroll">' +
            '<div id="inner" style="position: absolute; left: 150px; top: 150px; width:100px; height: 100px; background: red"></div>' +
            '<div id="inner2" style="position: absolute; left: 550px; top: 550px; width:100px; height: 100px; background: red"></div>' +
        '</div>'

    const scrollable        = t.$('#scrollable')
    const inner             = t.$('#inner')

    scrollable.scrollLeft   = 250
    scrollable.scrollTop    = 250

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})




describe('Scroll target into view should work', async t => {
    let scrollable
    let inner

    t.beforeEach(function () {
        document.body.innerHTML =
            '<div id="scrollable" style="background:#000;width:200px;height:100px;overflow:scroll">' +
                '<div id="inner" style="width:2000px;height:400px;background:#F00">INNER</div>' +
            '</div>'

        scrollable  = t.query('#scrollable')[ 0 ]
        inner       = t.query('#inner')[ 0 ]
    })

    t.it('Should be able to click on target with offset supplied', async t => {
        t.true(!isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')

        scrollElementPointIntoView(inner, [ 400, 200 ])

        t.false(!isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')
        t.true(isElementPointReachable(inner, [ 400, 200 ]))

        t.is(scrollable.scrollLeft, 399)
        t.is(scrollable.scrollTop, 199)
    })
})


describe('Scroll target into view should work #2', async t => {
    let scrollable
    let inner

    t.beforeEach(function () {
        document.body.innerHTML =
            '<div id="scrollable" style="background:#888;width:200px;height:100px;overflow:scroll">' +
                'Some text<br><br><br>' +
                '<div id="wrapper">' +
                    'Some text<br><br><br>' +
                    '<div id="inner" style="width:2000px;height:400px;background:#F00">INNER</div>' +
                '</div>' +
            '</div>'

        scrollable  = t.query('#scrollable')[ 0 ]
        inner       = t.query('#inner')[ 0 ]
    })

    t.it('Should be able to click on target with offset supplied', async t => {
        t.true(!isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')

        scrollElementPointIntoView(inner, [ 400, 200 ])

        t.false(!isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')
        t.true(isElementPointReachable(inner, [ 400, 200 ]))
    })
})
