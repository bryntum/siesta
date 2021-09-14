import { beforeEach, it } from "../../browser.js"
import { isElementAccessible, isElementConnected, isElementPointVisible } from "../../src/util_browser/Dom.js"
import { createElement } from "../@helpers.js"

const id    = id => document.getElementById(id)

beforeEach(() => {
    document.body.innerHTML = ''
})


it('`isElementConnected` should work', t => {
    const div       = createElement({
        children : [ { id : 'inner' } ]
    })

    t.false(isElementConnected(div))
    t.false(isElementConnected(div.querySelector('#inner')))
})


it('`isElementConnected` should work', t => {
    const div       = createElement({
        parent      : document.body,
        children    : [ { id : 'inner' } ]
    })

    t.true(isElementConnected(div))
    t.true(isElementConnected(div.querySelector('#inner')))
})


it('`isElementAccessible` should work', t => {
    const div       = createElement({
        parent      : document.body,

        children    : [
            {
                id          : 'div1',
                style       : 'display: none',
                children    : [
                    { id : 'inner1', tag : 'div', text : 'text1' }
                ]
            },
            {
                id          : 'div2',
                style       : 'visibility: hidden',
                children    : [
                    { id : 'inner2', tag : 'div', text : 'text2' }
                ]
            },
            {
                id          : 'div3',
                style       : 'position: absolute; left: 50px; top: 150px; width: 0; height: 100px;',
                children    : [
                    {
                        id      : 'inner3',
                        style   : 'border: 1px solid green; position: absolute; left: 5px; top: 5px; width: 10px; height: 10px;'
                    }
                ]
            }
        ]
    })

    t.false(isElementAccessible(div.querySelector('#div1')))
    t.false(isElementAccessible(div.querySelector('#inner1')))

    t.false(isElementAccessible(div.querySelector('#div2')))
    t.false(isElementAccessible(div.querySelector('#inner2')))

    t.false(isElementAccessible(div.querySelector('#div3')))
    t.true(isElementAccessible(div.querySelector('#inner3')))
})


it('`isElementPointVisible` should work', t => {
    const div       = createElement({
        parent      : document.body,

        id          : 'div1',
        style       : 'overflow: hidden; background-color: blue; position: absolute; left: 0px; top: 0px; width: 100px; height: 100px;',
        children    : [
            {
                id      : 'inner1',
                style   : 'background-color: green; position: absolute; left: 80px; top: 30px; width: 40px; height: 40px;'
            }
        ]
    })

    const inner1        = div.querySelector('#inner1')

    t.true(isElementPointVisible(inner1, [ 0, 0 ]).visible)
    t.true(isElementPointVisible(inner1, [ 0, 0 ]).visible)

    t.true(isElementPointVisible(inner1, [ 19, 0 ]).visible)

    t.false(isElementPointVisible(inner1, [ 20, 0 ]).visible)
    t.false(isElementPointVisible(inner1, [ 39, 0 ]).visible)
})


it('`isElementPointVisible` should work for elements inside iframe', async t => {
    const div       = createElement({
        parent      : document.body,

        id          : 'div1',
        style       : 'overflow: hidden; background-color: blue; position: absolute; left: 0px; top: 0px; width: 300px; height: 300px;',
    })

    const iframe    = createElement({
        tag     : 'iframe',
        style   : 'border: 0 solid; background-color: green; position: absolute; left: 150px; top: 150px; width: 300px; height: 300px;'
    }) as HTMLIFrameElement

    await t.waitForEvent(iframe, 'load', { trigger : () => div.appendChild(iframe) })

    const nestedDiv = createElement({
        parent      : iframe.contentDocument.body,

        id          : 'div1',
        style       : 'overflow: hidden; background-color: yellow; position: absolute; left: 100px; top: 100px; width: 100px; height: 100px;',
        children    : [
            {
                id      : 'inner1',
                style   : 'background-color: orange; position: absolute; left: 30px; top: 30px; width: 40px; height: 40px;'
            }
        ]
    })

    const inner1        = nestedDiv.querySelector('#inner1')

    t.true(isElementPointVisible(inner1, [ 0, 0 ], false).visible, "Locally `inner1` is fully visible")
    t.true(isElementPointVisible(inner1, [ 39, 39 ], false).visible, "Locally `inner1` is fully visible")

    let res     = isElementPointVisible(inner1, [ 0, 0 ], true)

    t.true(res.visible, "Globally left-top point of `inner1` is visible")
    res.visible && t.equal(res.globalXY, [ 280, 280 ], "Globally left-top point of `inner1` is visible")
    t.false(isElementPointVisible(inner1, [ 39, 39 ], true).visible, "Globally right-bottom point of `inner1` is not visible")

    t.true(isElementPointVisible(inner1, [ 19, 0 ], true).visible, "Right-most globally visible point of `inner1` on its top border")
    t.false(isElementPointVisible(inner1, [ 20, 0 ], true).visible, "Left-most globally invisible point of `inner1` on its top border")
})


it('Determine that element is hidden behind the scrollbar', t => {
    document.body.innerHTML =
        '<div style="position: absolute; left: 0; top: 0; background: blue; width: 200px; height: 200px; overflow: auto">' +
            '<div style="position: absolute; background: green; left: 100px; top: 100px; width: 200px; height: 200px" id="inner"></div>' +
        '</div>'

    t.false(isElementPointVisible(id('inner'), [ 0, 99 ]).visible, 'Point hidden by the scrollbar')
    t.false(isElementPointVisible(id('inner'), [ 99, 0 ]).visible, 'Point hidden by the scrollbar')
})


it('Determine that element is scrolled out of the view', t => {
    document.body.innerHTML =
        '<div style="position:absolute; left:100px; border:1px solid #ddd; width:200px; height:200px; overflow:auto">' +
            '<div style="position:absolute; background:#aaa; left:250px; width:50px; height:50px" id="inner">FOO</div>' +
        '</div>'

    t.false(isElementPointVisible(id('inner')).visible, 'Correctly determined scrolled out element')
})


it('Determine that element is not scrolled out of the view', t => {
    document.body.innerHTML =
        '<div style="position:absolute; left:100px; border:1px solid #ddd; width:200px; height:200px; overflow:auto">' +
            '<div style="position:absolute; background:#aaa; width:50px; height:50px" id="inner">FOO</div>' +
        '</div>'

    t.true(isElementPointVisible(id('inner')).visible, 'Correctly determined not scrolled out element')
})


it('Determine that element is scrolled out of the view', t => {
    document.body.innerHTML =
        '<div style="position:absolute; left:100px; border:1px solid #ddd; width:200px; height:200px; overflow:auto">' +
            '<div style="overflow:hidden; position:absolute; background:#aaa; width:50px; height:50px" id="inner">' +
                '<div style="position:absolute; background:red; left:45px; width:10px; height:10px" id="inner2"></div>' +
            '</div>' +
        '</div>'

    t.true(isElementPointVisible(id('inner')).visible)
    t.false(isElementPointVisible(id('inner2'), [ 5, 0 ]).visible, "Works with offset #1")
    t.true(isElementPointVisible(id('inner2'), [ 4, 0 ]).visible, "Works with offset #2")
})
