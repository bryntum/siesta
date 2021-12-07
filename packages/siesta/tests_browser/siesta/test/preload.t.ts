import { CI } from "chained-iterator"
import { it } from "../../../browser.js"
import { Assertion } from "../../../src/siesta/test/TestResult.js"
import { createElement } from "../../@helpers.js"

// TODO should have test for reporting of preload failures

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`preload` config should work', async t => {
    // @ts-ignore
    t.eq(window.PRELOAD_INLINE, true)

    // @ts-ignore
    t.eq(window.PRELOAD_FILE, true)

    // @ts-ignore
    t.eq(window.PRELOAD_FILE_MODULE, true)

    const el1       = createElement({ class : 'inline-class', parent : document.body })
    const el2       = createElement({ class : 'preload-file-class', parent : document.body })

    t.eq(getComputedStyle(el1).marginLeft, '10px')
    t.eq(getComputedStyle(el2).marginRight, '10px')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should report resource loading failures for `link` tags', async t => {
    t.todo('Internal', async t => {
        const el    = document.createElement('link')

        el.type     = 'text/css'
        el.rel      = 'stylesheet'
        el.href     = 'zxc_link'

        document.head.appendChild(el)

        await t.silent.waitForEvent(el, 'error')

    }).postFinishHook.on(todoTest => {
        const assertions    = CI(todoTest.eachResultOfClassDeep(Assertion)).toArray()

        t.eq(assertions.length, 1)

        assertions.forEach(assertion => {
            t.match(assertion.annotation.toString(), 'zxc_link')
        })
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should report resource loading failures for `script` tags', async t => {
    t.todo('Internal', async t => {
        const el    = document.createElement('script')

        el.type     = 'text/javascript'
        el.src      = 'zxc_script'

        document.head.appendChild(el)

        await t.silent.waitForEvent(el, 'error')

    }).postFinishHook.on(todoTest => {
        const assertions    = CI(todoTest.eachResultOfClassDeep(Assertion)).toArray()

        t.eq(assertions.length, 1)

        assertions.forEach(assertion => {
            t.match(assertion.annotation.toString(), 'zxc_script')
        })
    })
})
