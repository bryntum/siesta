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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to wait for component to become not visible, passed as component instance', async t => {
    const container = new Ext.container.Container({
        renderTo    : Ext.getBody(),
        style       : 'background-color: pink',
        html        : 'Some text'
    })

    setTimeout(() => container.setHidden(true), 100)

    await t.waitForComponentNotVisible(container)

    t.true(container.getHidden())
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to wait for component to become not visible, passed as component query', async t => {
    const container = new Ext.container.Container({
        renderTo    : Ext.getBody(),
        style       : 'background-color: pink',
        html        : 'Some text',
        itemId      : 'hidden'
    })

    setTimeout(() => container.setHidden(true), 100)

    await t.waitForComponentNotVisible('#hidden')

    t.true(container.getHidden())
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Waiting for component to become not visible should fail correctly', async t => {
    t.it({ title : 'internal', isTodo : true, defaultTimeout : 100 }, async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody(),
            style       : 'background-color: pink',
            html        : 'Some text',
            itemId      : 'hidden'
        })

        await t.waitForComponentNotVisible('#hidden')
    }).postFinishHook.on(test => {
        verifyAllFailed(test, t)

        t.is(test.assertions.length, 1)
    })
})
