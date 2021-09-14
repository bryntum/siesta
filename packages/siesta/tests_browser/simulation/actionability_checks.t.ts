import { beforeEach, it } from "../../browser.js"
import { isElementAccessible, isElementConnected, isElementPointVisible } from "../../src/util_browser/Dom.js"
import { createElement } from "../@helpers.js"

const id    = id => document.getElementById(id)

beforeEach(() => {
    document.body.innerHTML = ''
})


it('`isElementConnected` should work', t => {
    const div       = createElement({
        tag : 'div',
        children : [
            { id : 'inner', tag : 'div' }
        ]
    })

    t.false(isElementConnected(div))
    t.false(isElementConnected(div.querySelector('#inner')))
})


it('`isElementConnected` should work', t => {
    const div       = createElement({
        parent      : document.body,
        tag         : 'div',
        children    : [
            { id : 'inner', tag : 'div' }
        ]
    })

    t.true(isElementConnected(div))
    t.true(isElementConnected(id('inner')))
})


it('`isElementAccessible` should work', t => {
    const div       = createElement({
        parent      : document.body,

        children    : [
            {
                id          : 'div1',
                tag         : 'div',
                style       : 'display: none',
                children    : [
                    { id : 'inner1', tag : 'div', text : 'text1' }
                ]
            },
            {
                id          : 'div2',
                tag         : 'div',
                style       : 'visibility: hidden',
                children    : [
                    { id : 'inner2', tag : 'div', text : 'text2' }
                ]
            },
            {
                id          : 'div3',
                tag         : 'div',
                style       : 'position: absolute; left: 50px; top: 150px; width: 0; height: 100px; ',
                children    : [
                    {
                        id      : 'inner3',
                        tag     : 'div',
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

        children    : [
            {
                id          : 'div1',
                tag         : 'div',
                style       : 'overflow: hidden; background-color: blue; position: absolute; left: 0px; top: 0px; width: 100px; height: 100px; ',
                children    : [
                    {
                        id      : 'inner1',
                        tag     : 'div',
                        style   : 'background-color: green; position: absolute; left: 80px; top: 30px; width: 40px; height: 40px;'
                    }
                ]
            }
        ]
    })

    const inner1        = div.querySelector('#inner1')

    t.true(isElementPointVisible(inner1, [ 0, 0 ]))

    t.true(isElementPointVisible(inner1, [ 0, 19 ]))

    debugger

    t.false(isElementPointVisible(inner1, [ 0, 20 ]))
})
