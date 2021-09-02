import { it } from "../../browser.js"
import { delay } from "../../src/util/TimeHelpers.js"

it('Should be able to click on an element', async t => {
    const div           = document.createElement('div')

    div.setAttribute('style', 'position: absolute; left: 0; top: 0; width: 100px; height: 100px; background-color: green')

    const mouseDown     = t.createSpy('mouseDown')
    const mouseUp       = t.createSpy('mouseUp')
    const click         = t.createSpy('click')

    div.addEventListener('mousedown', mouseDown)
    div.addEventListener('mouseup', mouseUp)
    div.addEventListener('click', click)

    document.body.appendChild(div)

    await t.click([ 0, 0 ])

    t.expect(mouseDown).toHaveBeenCalled(1)
    t.expect(mouseUp).toHaveBeenCalled(1)
    t.expect(click).toHaveBeenCalled(1)
})

