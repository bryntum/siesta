import { beforeEach, it } from "../../../browser.js"
import { isElementPointVisible } from "../../../src/util_browser/Dom.js"
import { scrollElementPointIntoView } from "../../../src/util_browser/Scroll.js"

beforeEach(() => {
    document.body.innerHTML = ''
})

// IMPORTANT: This test assumes `expandBody=false`

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, direct child of <body>, from bottom', async t => {
    document.body.innerHTML =
        '<div style="position: relative; width: 10px; height: 2500px; background: blue;">scroller</div>' +
        '<div id="inner" style="position: absolute; left: 100px; top: 1100px; width: 50px; height: 200px; background: red;"></div>'

    document.scrollingElement.scrollTop = 1000

    const inner         = t.$('#inner')

    t.true(isElementPointVisible(inner, [ 25, 100 ]).visible, 'Point is initially scrolled out')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to scroll element point into view, direct child of <body>, from bottom', async t => {
    document.body.innerHTML =
        '<div style="position: relative; width: 10px; height: 2500px; background: blue;">scroller</div>' +
        '<div id="inner" style="position: absolute; left: 100px; top: 1100px; width: 50px; height: 200px; background: red;"></div>'

    document.scrollingElement.scrollTop = 1500

    const inner         = t.$('#inner')

    t.false(isElementPointVisible(inner, [ 25, 100 ]).visible, 'Point is initially scrolled out')

    scrollElementPointIntoView(inner, [ 25, 100 ])

    t.true(isElementPointVisible(inner, [ 25, 100 ]).visible, 'Point was scrolled in')
})


