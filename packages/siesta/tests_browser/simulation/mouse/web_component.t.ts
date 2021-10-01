import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class WebComp extends HTMLElement {
    constructor () {
        super()

        this.attachShadow({ mode : 'open' })
    }
}

window.customElements.define('web-comp', WebComp)


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support clicking on the element inside of the web component', async t => {
    const comp          = new WebComp()
    comp.style.cssText  = 'position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;'

    const div           = comp.shadowRoot.appendChild(document.createElement('div'))

    div.style.cssText   = 'position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;'
    div.id              = 'marker'

    document.body.appendChild(comp)

    const verifyEvent   = (event : MouseEvent) => {
        t.silent.is(event.target, comp, 'Global root doc event should have the web component as the target')
        t.silent.equal(
            event.composedPath(),
            [ div, comp.shadowRoot, comp, document.body, document.documentElement, document, window ],
            'Root doc event should have correct path'
        )
        t.silent.is(event.composed, true, 'event composed')
    }

    document.documentElement.addEventListener('mousedown', verifyEvent)
    document.documentElement.addEventListener('mouseup', verifyEvent)
    document.documentElement.addEventListener('click', verifyEvent)

    t.firesOnce(document.documentElement, 'click')
    t.firesOnce('web-comp -> #marker', 'click')

    await t.click('web-comp -> #marker')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support clicking pure text web component', async t => {
    const comp          = new WebComp()
    comp.style.cssText  = 'position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: pink;'

    const textNode      = comp.shadowRoot.appendChild(document.createTextNode('foo'))

    document.body.appendChild(comp)

    t.firesOnce(document.documentElement, 'click')
    t.firesOnce('web-comp', 'click')

    await t.click('web-comp')
})

