import { beforeEach, it } from "../../../sencha.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => comp.destroy())
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to wait for component to become visible, passed as component instance', async t => {
    const container = new Ext.container.Container({
        renderTo    : Ext.getBody(),
        style       : 'background-color: pink',
        html        : 'Some text',
        hidden      : true
    })

    setTimeout(() => container.setHidden(false), 100)

    await t.waitForComponentVisible(container)

    t.false(container.getHidden())
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to wait for component to become visible, passed as component query', async t => {
    const container = new Ext.container.Container({
        renderTo    : Ext.getBody(),
        style       : 'background-color: pink',
        html        : 'Some text',
        hidden      : true,
        itemId      : 'hidden'
    })

    setTimeout(() => container.setHidden(false), 100)

    await t.waitForComponentVisible('#hidden')

    t.false(container.getHidden())
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Waiting for component to become visible should fail correctly', async t => {
    t.it({ title : 'internal', isTodo : true, defaultTimeout : 100 }, async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody(),
            style       : 'background-color: pink',
            html        : 'Some text',
            itemId      : 'hidden',
            hidden      : true
        })

        await t.waitForComponentVisible('#hidden')
    }).postFinishHook.on(test => {
        verifyAllFailed(test, t)

        t.is(test.assertions.length, 1)
    })
})



// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Should be able to wait for component query to become visible', async t => {
//     // const container = new Ext.container.Container({
//     //     renderTo    : Ext.getBody(),
//     //     itemId      : 'hidden',
//     //     hidden      : true
//     // })
//     //
//     // setTimeout(() => container.setVisible(true))
//     //
//     // await t.waitForComponentVisible(container)
//     //
//     // t.true(container.getVisible())
//     //
//     // t.is(t.normalizeElement(container), container.getEl().dom, "Hidden components should be normalized to their root el")
//     //
//     // let afterWait   = false
//     //
//     // t.waitForCQVisible('#hidden', function () {
//     //     t.ok(afterWait, "waitForCQVisible triggered its callback already after 500ms delay and manual call to `setVisible`")
//     // })
//     //
//     // t.chain(
//     //     'waitFor(500)',
//     //     function () {
//     //         afterWait       = true
//     //         container.setVisible(true)
//     //     }
//     // )
//
// })
//
//
