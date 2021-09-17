import { beforeEach, it } from "../../../browser.js"
import { isElementPointReachable, isElementPointVisible } from "../../../src/util_browser/Dom.js"
import { scrollElementPointIntoView } from "../../../src/util_browser/Scroll.js"

beforeEach(() => {
    document.body.innerHTML = ''
})


it('Should be able to scroll element point into view, direct child of <body>, from bottom', async t => {
    document.body.innerHTML =
        '<div id="inner" style="position: absolute; left: 150px; top: 2000px; width: 100px; height: 100px; background: red"></div>'

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})


it('Should be able to scroll element point into view, direct child of <body>, from top', async t => {
    document.body.innerHTML =
        '<div id="sizer" style="position: absolute; left: 150px; top: 3000px; width: 100px; height: 100px; background: red"></div>' +
        '<div id="inner" style="position: absolute; left: 150px; top: 1000px; width: 100px; height: 100px; background: red"></div>'

    document.scrollingElement.scrollTop = 1500

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})



it('Should be able to scroll element point into view, from right', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: scroll">' +
            '<div id="inner" style="position: absolute; left: 150px; top: 150px; width: 100px; height: 100px; background: red"></div>' +
        '</div>'

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})


it('Should be able to scroll element point into view, from left', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: scroll">' +
            '<div id="inner" style="position: absolute; left: 150px; top: 150px; width: 100px; height: 100px; background: red"></div>' +
            '<div id="inner2" style="position: absolute; left: 550px; top: 550px; width: 100px; height: 100px; background: red"></div>' +
        '</div>'

    const scrollable        = t.$('#scrollable')
    const inner             = t.$('#inner')

    scrollable.scrollLeft   = 250
    scrollable.scrollTop    = 250

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})


it('Should be able to scroll element point into view, with partially visible parent element', async t => {
    document.body.innerHTML =
        '<div style="background: blue; position: absolute; left: 0; top: 0; width: 300px; height: 300px; overflow: hidden">' +
            '<div style="background: red; position: absolute; left: 150px; top: 150px; width: 300px; height: 300px; overflow: scroll">' +
                '<div style="position: absolute; left: 600px; top: 600px; width: 100px; height: 100px; background: green"></div>' +
                '<div id="inner" style="position: absolute; left: 400px; top: 400px; width: 100px; height: 100px; background: green"></div>' +
            '</div>' +
        '</div>'

    const scrollable    = t.$('#scrollable')
    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')
})


it('Should be able to scroll element point into view #1', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="background: #000; width: 200px; height: 100px; overflow: scroll">' +
            '<div id="inner" style="width: 2000px; height: 400px; background: #F00">INNER</div>' +
        '</div>'

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 400, 200 ])

    t.true(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')
    t.true(isElementPointReachable(inner, [ 400, 200 ]).reachable)
})


it('Should be able to scroll element point into view #2', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="background: #888; width: 200px; height: 100px; overflow: scroll">' +
            'Some text<br><br><br>' +
            '<div id="wrapper">' +
                'Some text<br><br><br>' +
                '<div id="inner" style="width: 2000px; height: 400px; background: #F00">INNER</div>' +
            '</div>' +
        '</div>'

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 400, 200 ])

    t.true(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point was scrolled in')
    t.true(isElementPointReachable(inner, [ 400, 200 ]).reachable)
})
