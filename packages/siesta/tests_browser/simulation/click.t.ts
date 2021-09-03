import { it } from "../../browser.js"
import { delay } from "../../src/util/TimeHelpers.js"

it('Should be able to click on an element', async t => {
    const style         = document.createElement('style')

    style.innerHTML     = 'div:hover { background: blue }'

    const div           = document.createElement('div')

    div.setAttribute('style', 'position: absolute; left: 35px; top: 35px; width: 100px; height: 100px; border: 5px solid; border-color: green')

    const mouseDown     = t.createSpy('mouseDown')
    const mouseUp       = t.createSpy('mouseUp')
    const click         = t.createSpy('click')

    div.addEventListener('mousedown', mouseDown)
    div.addEventListener('mouseup', mouseUp)
    div.addEventListener('click', click)

    document.body.appendChild(style)
    document.body.appendChild(div)

    await t.click([ 0, 0 ])

    await delay(500)

    await t.click([ 0, 50 ])

    await delay(500)

    await t.click([ 50, 50 ])

    await delay(500)

    await t.click([ 50, 0 ])

    await delay(500)

    await t.click([ 0, 0 ])

    await delay(500)

    t.expect(mouseDown).toHaveBeenCalled(1)
    t.expect(mouseUp).toHaveBeenCalled(1)
    t.expect(click).toHaveBeenCalled(1)
})

