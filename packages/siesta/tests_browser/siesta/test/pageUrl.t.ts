import { it } from "../../../browser.js"
import { createElement } from "../../@helpers.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`pageUrl` config should work', async t => {
    // @ts-ignore
    t.is(window.PRELOAD_FILE_MODULE, true)

    // @ts-ignore
    t.is(window.PRELOAD_FILE, true)

    const el2       = createElement({ class : 'preload-file-class', parent : document.body })

    t.eq(getComputedStyle(el2).marginRight, '10px')
})


