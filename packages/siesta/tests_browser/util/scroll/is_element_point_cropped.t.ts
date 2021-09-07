import { it } from "../../../browser.js"
import { isElementPointCropped } from "../../../src/util_browser/Scroll.js"

const id    = id => document.getElementById(id)

it('Determine that element is scrolled out of the view', t => {
    document.body.innerHTML =
        '<div style="position:absolute; left:100px; border:1px solid #ddd; width:200px; height:200px; overflow:auto">' +
            '<div style="position:absolute; background:#aaa; left:250px; width:50px; height:50px" id="inner">FOO</div>' +
        '</div>'

    t.true(isElementPointCropped(id('inner')), 'Correctly determined scrolled out element')
})


it('Determine that element is not scrolled out of the view', t => {
    document.body.innerHTML =
        '<div style="position:absolute; left:100px; border:1px solid #ddd; width:200px; height:200px; overflow:auto">' +
            '<div style="position:absolute; background:#aaa; width:50px; height:50px" id="inner">FOO</div>' +
        '</div>'

    t.false(isElementPointCropped(id('inner')), 'Correctly determined not scrolled out element')
})


it('Determine that element is scrolled out of the view', t => {
    document.body.innerHTML =
        '<div style="position:absolute; left:100px; border:1px solid #ddd; width:200px; height:200px; overflow:auto">' +
            '<div style="overflow:hidden; position:absolute; background:#aaa; width:50px; height:50px" id="inner">' +
                '<div style="position:absolute; background:red; left:45px; width:10px; height:10px" id="inner2"></div>' +
            '</div>' +
        '</div>'

    t.false(isElementPointCropped(id('inner')))
    t.true(isElementPointCropped(id('inner2'), [ 5, 0 ]), "Works with offset #1")
    t.false(isElementPointCropped(id('inner2'), [ 4, 0 ]), "Works with offset #2")
})
