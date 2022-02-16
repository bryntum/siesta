import { it } from "../../browser.js"
import { compareDeepDiff } from "../../src/compare_deep/DeepDiff.js"


it('Deep comparison should not throw on built-in objects', async t => {
    t.doesNotThrow(() => compareDeepDiff(window, window.location))
})
