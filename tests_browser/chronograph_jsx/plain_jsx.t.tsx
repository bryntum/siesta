/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { it, iit } from "../../browser.js"
import { ChronoGraphJSX } from "../../src/chronograph-jsx/ChronoGraphJSX.js"
import { ReactiveHTMLElement } from "../../src/chronograph-jsx/ElementReactivity.js"

ChronoGraphJSX

it('Should render the plain JSX element', async t => {
    const onclick   = t.createSpy()

    const el        = <div id="some_id" class="cls" style="width: 100px" onclick={ onclick }></div> as HTMLElement

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.id, 'some_id')
    t.is(el.className, 'cls')
    t.is(el.style.width, '100px')

    el.click()

    t.expect(onclick).toHaveBeenCalled(1)
})


it('Should render the reactive JSX element', async t => {
    const onclick   = t.createSpy()

    let boxCounter      = 0
    let styleCounter    = 0

    const boxCls    = Box.new('cls')
    const boxWidth  = Box.new(10)

    const el        = <div
        onclick = { onclick }
        class   = { () => (boxCounter++, boxCls.read()) }
        style   = { () => (styleCounter++, `width: ${ boxWidth.read() }px`) }
    ></div> as ReactiveHTMLElement

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.className, 'cls')
    t.is(el.style.width, '10px')

    t.is(boxCounter, 1)
    t.is(styleCounter, 1)

    //-------------------
    el.click()

    t.expect(onclick).toHaveBeenCalled(1)

    //-------------------
    boxCls.write('cls2')

    globalGraph.commit()

    t.is(el.className, 'cls2')
    t.is(el.style.width, '10px')

    t.is(boxCounter, 2)
    t.is(styleCounter, 1)

    //-------------------
    boxWidth.write(100)

    globalGraph.commit()

    t.is(el.className, 'cls2')
    t.is(el.style.width, '100px')

    t.is(boxCounter, 2)
    t.is(styleCounter, 2)
})


it('Should render the plain JSX element with reactive children correctly', async t => {
    let boxCounter      = 0
    let styleCounter    = 0

    const boxCls    = Box.new('cls')
    const boxWidth  = Box.new(10)

    const wrapper   = <div>
        <div>
            <div id="nested_reactive" class={ () => (boxCounter++, boxCls.read()) } style={ () => (styleCounter++, `width: ${ boxWidth.read() }px`) }></div>
        </div>
    </div>

    document.body.appendChild(wrapper)

    const el        = document.getElementById("nested_reactive")

    globalGraph.commit()

    t.is(el.className, 'cls')
    t.is(el.style.width, '10px')

    t.is(boxCounter, 1)
    t.is(styleCounter, 1)

    //-------------------
    boxCls.write('cls2')

    globalGraph.commit()

    t.is(el.className, 'cls2')
    t.is(el.style.width, '10px')

    t.is(boxCounter, 2)
    t.is(styleCounter, 1)

    //-------------------
    boxWidth.write(100)

    globalGraph.commit()

    t.is(el.className, 'cls2')
    t.is(el.style.width, '100px')

    t.is(boxCounter, 2)
    t.is(styleCounter, 2)
})


it('Should support the reactive class activators', async t => {
    const boxCls    = Box.new(true)

    const el   = <div class="static_cls" class:cls={ boxCls } class:static={ true }></div>

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.className, 'static_cls static cls')

    //-------------------
    boxCls.write(false)

    globalGraph.commit()

    t.is(el.className, 'static_cls static')
})


it('Should correctly merge reactive class property and reactive class activators', async t => {
    const classAttributeBox = Box.new('cls')
    const activatorBoxCls   = Box.new(true)

    const el   = <div class={ classAttributeBox } class:cls={ activatorBoxCls }></div>

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.className, 'cls')

    //-------------------
    activatorBoxCls.write(false)

    globalGraph.commit()

    t.is(el.className, '')

    //-------------------
    classAttributeBox.write('cls new')

    globalGraph.commit()

    t.is(el.className, 'new')
})


it('Should support the reactive individual style properties', async t => {
    const boxWidth  = Box.new('10px')

    const el        = <div style="height: 10px" style:width={ boxWidth } style:color={ "red" }></div> as ReactiveHTMLElement

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.style.width, '10px')
    t.is(el.style.height, '10px')
    t.is(el.style.color, 'red')

    //-------------------
    boxWidth.write('100px')

    globalGraph.commit()

    t.is(el.style.width, '100px')
    t.is(el.style.height, '10px')
    t.is(el.style.color, 'red')
})


it('Should correctly merge reactive style property and reactive individual style properties', async t => {
    const styleAttributeBox     = Box.new('height: 10px')
    const widthPropertyBox      = Box.new('10px')

    const el        = <div style={ styleAttributeBox } style:width={ widthPropertyBox }></div> as ReactiveHTMLElement

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.style.width, '10px')
    t.is(el.style.height, '10px')

    //-------------------
    styleAttributeBox.write('height: 100px')

    globalGraph.commit()

    t.is(el.style.width, '10px')
    t.is(el.style.height, '100px')

    //-------------------
    styleAttributeBox.write('width: 1px')

    globalGraph.commit()

    t.is(el.style.width, '10px', 'Individual style property overwrites the "style" attribute')
    t.is(el.style.height, '')
})
