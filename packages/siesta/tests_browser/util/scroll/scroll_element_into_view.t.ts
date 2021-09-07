import { describe } from "../../../browser.js"
import { isElementPointReachable } from "../../../src/util_browser/Dom.js"
import { isElementPointCropped, scrollElementPointIntoView } from "../../../src/util_browser/Scroll.js"

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
        t.true(isElementPointCropped(inner, [ 400, 200 ]), 'Click point is initially scrolled out')

        scrollElementPointIntoView(inner, [ 400, 200 ])

        t.false(isElementPointCropped(inner, [ 400, 200 ]), 'Click point is initially scrolled out')
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
        t.true(isElementPointCropped(inner, [ 400, 200 ]), 'Click point is initially scrolled out')

        scrollElementPointIntoView(inner, [ 400, 200 ])

        t.false(isElementPointCropped(inner, [ 400, 200 ]), 'Click point is initially scrolled out')
        t.true(isElementPointReachable(inner, [ 400, 200 ]))
    })
})
