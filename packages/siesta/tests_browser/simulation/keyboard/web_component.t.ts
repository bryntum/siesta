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
it('Should support typing on the element inside of the web component', async t => {
    const comp          = new WebComp()
    comp.style.cssText  = 'position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;'

    const input         = comp.shadowRoot.appendChild(document.createElement('input'))
    input.style.cssText = 'width: 90px'

    document.body.appendChild(comp)

    const verifyEvent   = (event : KeyboardEvent) => {
        t.silent.is(event.target, comp, 'Global root doc event should have the web component as the target')
        t.silent.equal(
            event.composedPath(),
            [ input, comp.shadowRoot, comp, document.body, document.documentElement, document, window ],
            'Root doc event should have correct path'
        )
        t.silent.is(event.composed, true, 'event composed')
    }

    document.documentElement.addEventListener('keydown', verifyEvent)
    document.documentElement.addEventListener('keyup', verifyEvent)
    document.documentElement.addEventListener('keypress', verifyEvent)

    const text      = 'Sure does'

    t.firesOk(document.documentElement, { 'keydown' : text.length, 'keyup' : text.length, keypress : text.length })
    t.firesOk('web-comp -> input', { 'keydown' : text.length, 'keyup' : text.length, keypress : text.length })

    await t.type('web-comp -> input', text)

    t.elementValueIs('web-comp -> input', 'Sure does', '`elementValueIs` works')
    t.is(input.value, 'Sure does', 'typed successfully')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('tabbing', async t => {
    const comp              = new WebComp()
    comp.style.cssText      = 'position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;'

    const input1            = comp.shadowRoot.appendChild(document.createElement('input'))
    input1.id               = 'input1'
    input1.style.cssText    = 'width: 90px'

    const input2            = comp.shadowRoot.appendChild(document.createElement('input'))
    input2.id               = 'input2'
    input2.style.cssText    = 'width: 90px'

    document.body.appendChild(comp)

    t.firesAtLeastNTimes(document.documentElement, 'keydown', 1)

    await t.type('web-comp -> #input1', 'Sure does[TAB]Foo')

    t.is(input1.value, 'Sure does', 'typed successfully')
    t.is(input2.value, 'Foo', 'Tabbed successfully')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('activeElement', async t => {
    const comp              = new WebComp()
    comp.style.cssText      = 'position: absolute; left: 50px; top: 50px; width: 100px; height: 100px; background: blue;'

    const input1            = comp.shadowRoot.appendChild(document.createElement('input'))
    input1.id               = 'input1'
    input1.style.cssText    = 'width: 90px'

    const div               = comp.shadowRoot.appendChild(document.createElement('div'))

    div.style.cssText       = 'position: absolute; left: 50px; top: 50px; width: 1px; height: 1px; background: red;'
    div.id                  = 'div'

    document.body.appendChild(comp)

    await t.click('web-comp -> #div')

    t.is(document.activeElement, document.body, 'Body is activeElement if clicking non-focusable child of web component')
    t.is(t.activeElement, document.body, 'Body is activeElement if clicking non-focusable child of web component')

    await t.click('web-comp -> #input1')

    t.is(document.activeElement, comp, 'Web component element is activeElement if clicking focusable child of web component')
    t.is(t.activeElement, input1, 'Web component element is activeElement if clicking focusable child of web component')
 })

