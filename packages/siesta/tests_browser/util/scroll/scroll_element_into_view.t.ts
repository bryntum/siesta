import { beforeEach, it } from "../../../browser.js"
import { Rect } from "../../../src/util/Rect.js"
import { getViewportRect } from "../../../src/util_browser/Coordinates.js"
import { isElementPointReachable, isElementPointVisible } from "../../../src/util_browser/Dom.js"
import { getMaxScroll, scrollElementPointIntoView } from "../../../src/util_browser/Scroll.js"
import { createPositionedElement, createPositionedIframe } from "../../@helpers.js"

beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, direct child of <body>, from bottom', async t => {
    document.body.innerHTML =
        '<div id="inner" style="position: absolute; left: 150px; top: 2000px; width: 100px; height: 100px; background: red"></div>'

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')

    t.is(document.documentElement.scrollTop, getMaxScroll(document.documentElement, 'y'))
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, direct child of <body>, from top', async t => {
    document.body.innerHTML =
        '<div id="sizer" style="position: absolute; left: 150px; top: 3000px; width: 100px; height: 100px; background: red"></div>' +
        '<div id="inner" style="position: absolute; left: 150px; top: 1000px; width: 100px; height: 100px; background: red"></div>'

    document.scrollingElement.scrollTop = 1500

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')

    t.is(Rect.fromElement(inner).center[ 1 ], getViewportRect(window).center[ 1 ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, from right', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: scroll">' +
            '<div id="inner" style="position: absolute; left: 150px; top: 150px; width: 100px; height: 100px; background: red"></div>' +
        '</div>'

    const scrollable    = t.$('#scrollable') as HTMLElement
    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')

    t.is(scrollable.scrollLeft, getMaxScroll(scrollable, 'x'))
    t.is(scrollable.scrollTop, getMaxScroll(scrollable, 'y'))
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, from left', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: scroll">' +
            '<div id="inner" style="position: absolute; left: 150px; top: 150px; width: 100px; height: 100px; background: red"></div>' +
            '<div id="inner2" style="position: absolute; left: 550px; top: 550px; width: 100px; height: 100px; background: red"></div>' +
        '</div>'

    const scrollable        = t.$('#scrollable') as HTMLElement
    const inner             = t.$('#inner')

    scrollable.scrollLeft   = 250
    scrollable.scrollTop    = 250

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')

    t.equal(Rect.fromElement(inner).center, Rect.fromElementContent(scrollable).center)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, with partially visible parent element', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="background: blue; position: absolute; left: 0; top: 0; width: 300px; height: 300px; overflow: hidden">' +
            '<div id="canvas" style="background: red; position: absolute; left: 150px; top: 150px; width: 300px; height: 300px; overflow: scroll">' +
                '<div style="position: absolute; left: 600px; top: 600px; width: 100px; height: 100px; background: green"></div>' +
                '<div id="inner" style="position: absolute; left: 400px; top: 400px; width: 100px; height: 100px; background: green"></div>' +
            '</div>' +
        '</div>'

    const scrollable        = t.$('#scrollable') as HTMLElement
    const canvas            = t.$('#canvas') as HTMLElement
    const inner             = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ])

    t.true(isElementPointVisible(inner, [ 50, 50 ]).visible, 'Point was scrolled in')

    t.equal(Rect.fromElement(inner).center, Rect.fromElement(scrollable).intersect(Rect.fromElement(canvas)).center)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view #1', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="background: #000; width: 200px; height: 100px; overflow: scroll">' +
            '<div id="inner" style="width: 2000px; height: 400px; background: #F00">INNER</div>' +
        '</div>'

    const scrollable        = t.$('#scrollable') as HTMLElement
    const inner             = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 400, 200 ])

    t.true(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')
    t.true(isElementPointReachable(inner, [ 400, 200 ]).reachable)

    t.equal(Rect.fromElementContent(scrollable).center, Rect.fromElement(inner).shift(400, 200).leftTop)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view #2', async t => {
    document.body.innerHTML =
        '<div id="scrollable" style="background: #888; width: 200px; height: 100px; overflow: scroll">' +
            'Some text<br><br><br>' +
            '<div id="wrapper">' +
                'Some text<br><br><br>' +
                '<div id="inner" style="width: 2000px; height: 400px; background: red; position: relative">' +
                    '<div style="background: black; position: absolute; left: 399px; top: 199px; width: 3px; height: 3px; border-radius: 50%"></div>' +
                '</div>' +
            '</div>' +
        '</div>'

    const scrollable        = t.$('#scrollable') as HTMLElement
    const inner             = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 400, 200 ])

    t.true(isElementPointVisible(inner, [ 400, 200 ]).visible, 'Click point was scrolled in')
    t.true(isElementPointReachable(inner, [ 400, 200 ], true).reachable)

    //------------------
    t.equal(Rect.fromElementContent(scrollable).center, Rect.fromElement(inner).shift(400, 200).leftTop)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`scrollElementPointIntoView` should work for elements inside the iframes', async t => {
    const iframe1       = await createPositionedIframe('about:blank', { left : 1000, top : 1000, width : 300, height : 300 })
    iframe1.style.backgroundColor   = 'red'

    const div1          = createPositionedElement('div', { left : 500, top : 500, width : 100, height : 100 }, iframe1.contentDocument)

    div1.style.backgroundColor      = 'blue'
    div1.id             = 'inner'

    iframe1.contentDocument.body.appendChild(div1)

    const inner         = iframe1.contentDocument.querySelector('#inner')

    //------------------
    t.false(isElementPointVisible(inner, [ 50, 50 ], true).visible, 'Click point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 50, 50 ], true)

    t.true(isElementPointVisible(inner, [ 50, 50 ], true).visible, 'Click point was scrolled in')

    //------------------
    const docEl         = document.documentElement

    t.is(docEl.scrollLeft, getMaxScroll(docEl, 'x'))
    t.is(docEl.scrollTop, getMaxScroll(docEl, 'y'))

    const iframeDocEl   = iframe1.contentDocument.documentElement

    t.is(iframeDocEl.scrollLeft, getMaxScroll(iframeDocEl, 'x'))
    t.is(iframeDocEl.scrollTop, getMaxScroll(iframeDocEl, 'y'))
})
