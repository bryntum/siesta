import { it } from "../../../browser.js"
import { createElement } from "../../@helpers.js"

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
