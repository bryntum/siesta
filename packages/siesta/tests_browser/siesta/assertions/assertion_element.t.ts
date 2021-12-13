import { beforeEach, it } from "../../../browser.js"
import { measure } from "../../../src/util/TimeHelpers.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"
import { createElement } from "../../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})

const defaultDelay = 50

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`waitForSelector` assertion should work', async t => {
    setTimeout(() => createElement({ parent : document.body, id : 'delayed' }), defaultDelay)

    const result        = await measure(t.waitForSelector('#delayed'))

    t.eq(result.resolved, [ document.querySelector('#delayed') ])
    t.isGreaterOrEqual(result.elapsed, defaultDelay)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`waitForSelector` should fail correctly', async t => {
    t.it({ title : 'internal', isTodo : true, defaultTimeout : defaultDelay }, async t => {
        await t.waitForSelector('#unexisted')
    }).postFinishHook.on(test => {
        verifyAllFailed(test, t)

        t.is(test.assertions.length, 1)
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`waitForSelectors` assertion should work', async t => {
    let div1, div2, div3

    setTimeout(() => div1 = createElement({ parent : document.body, class : 'div1' }), defaultDelay)
    setTimeout(() => div2 = createElement({ parent : document.body, class : 'div2' }), defaultDelay * 2)
    setTimeout(() => div3 = createElement({ parent : document.body, class : 'div3' }), defaultDelay * 3)

    const result        = await measure(t.waitForSelectors([ '.div1', 'div.div2', 'body > div.div3' ]))

    t.eq(result.resolved, [ [ div1 ], [ div2 ], [ div3 ] ])
    t.isGreaterOrEqual(result.elapsed, defaultDelay)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`waitForSelectors` should fail correctly', async t => {
    t.it({ title : 'internal', isTodo : true, defaultTimeout : defaultDelay }, async t => {
        await t.waitForSelectors([ '#unexisted', 'body' ])
    }).postFinishHook.on(test => {
        verifyAllFailed(test, t)

        t.is(test.assertions.length, 1)
    })
})
