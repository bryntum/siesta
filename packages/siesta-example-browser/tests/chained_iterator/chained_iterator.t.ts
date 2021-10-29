import { it } from "@bryntum/siesta/browser.js"


it('Should be able to simulate user actions', async t => {
    await t.click(document.body)

    await t.type([], 'some text')

    await t.waitForEvent(document.body, 'click')
})

