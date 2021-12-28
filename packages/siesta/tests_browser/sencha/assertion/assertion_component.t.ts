import { beforeEach, it } from "../../../sencha.js"
import { measureTrigger } from "../../../src/util/TimeHelpers.js"
import { verifyAllFailed } from "../../../tests/siesta/@helpers.js"

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => comp.destroy())
})

const defaultDelay      = 100


it('`waitForComponentVisible/waitForComponentNotVisible` methods should work', async t => {
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Should be able to wait for component to become visible, passed as component instance', async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody(),
            style       : 'background-color: pink',
            html        : 'Some text',
            hidden      : true
        })

        const result        = await measureTrigger(
            t.waitForComponentVisible(container),
            () => setTimeout(() => container.setHidden(false), defaultDelay)
        )

        t.false(container.getHidden())
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
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

        const result        = await measureTrigger(
            t.waitForComponentVisible('#hidden'),
            () => setTimeout(() => container.setHidden(false), defaultDelay)
        )

        t.false(container.getHidden())
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Waiting for component to become visible should fail correctly', async t => {
        t.it({ title : 'internal', isTodo : true, defaultTimeout : defaultDelay }, async t => {
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

        const result        = await measureTrigger(
            t.waitForComponentNotVisible(container),
            () => setTimeout(() => container.setHidden(true), defaultDelay)
        )

        t.true(container.getHidden())
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Should be able to wait for component to become not visible, passed as component query', async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody(),
            style       : 'background-color: pink',
            html        : 'Some text',
            itemId      : 'hidden'
        })

        const result        = await measureTrigger(
            t.waitForComponentNotVisible('#hidden'),
            () => setTimeout(() => container.setHidden(true), defaultDelay)
        )

        t.true(container.getHidden())
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Waiting for component to become not visible should fail correctly', async t => {
        t.it({ title : 'internal', isTodo : true, defaultTimeout : defaultDelay }, async t => {
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
})


it('`waitForComponentQuery` / `waitForComponentQueryNotFound` methods should work', async t => {
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Should be able to wait for component query', async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody()
        })

        let button

        const result        = await measureTrigger(
            t.waitForComponentQuery('button[moo=zoo]'),
            () => setTimeout(() => {
                button          = new Ext.Button({ text : 'Button', moo : 'zoo' })

                container.add(button)
            }, defaultDelay)
        )

        t.eq(result.resolved, [ button ])
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Should be able to wait for component query with root', async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody()
        })

        let button

        const result        = await measureTrigger(
            t.waitForComponentQuery({ target : 'button[moo=zoo]', root : container }),
            () => setTimeout(() => {
                button          = new Ext.Button({ text : 'Button', moo : 'zoo' })

                container.add(button)
            }, defaultDelay)
        )

        t.eq(result.resolved, [ button ])
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Waiting for component query should fail correctly', async t => {
        t.it({ title : 'internal', isTodo : true, defaultTimeout : defaultDelay }, async t => {
            await t.waitForComponentQuery('#absent')
        }).postFinishHook.on(test => {
            verifyAllFailed(test, t)

            t.is(test.assertions.length, 1)
        })
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Should be able to wait for component query to resolve to empty array', async t => {
        const button        = new Ext.Button({ text : 'Button', moo : 'zoo' })

        const result        = await measureTrigger(
            t.waitForComponentQueryNotFound('button[moo=zoo]'),
            () => setTimeout(() => button.destroy(), defaultDelay)
        )

        t.eq(result.resolved, [])
        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Should be able to wait for component query to resolve to empty array with root', async t => {
        const button        = new Ext.Button({ text : 'Button', moo : 'zoo' })

        const container     = new Ext.container.Container({
            renderTo    : Ext.getBody(),

            items       : [
                { xtype : 'button', text : 'Button', moo : 'zoo', id : 'moo' }
            ]
        })

        const result        = await measureTrigger(
            t.waitForComponentQueryNotFound({ target : 'button[moo=zoo]', root : container }),
            () => setTimeout(() => Ext.getCmp('moo').destroy(), defaultDelay)
        )

        t.eq(result.resolved, [])

        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`waitForComponentQueryNotFound` should fail correctly', async t => {
        t.it({ title : 'internal', isTodo : true, defaultTimeout : defaultDelay }, async t => {
            const button        = new Ext.Button({ text : 'Button', moo : 'zoo' })

            await t.waitForComponentQueryNotFound('button[moo=zoo]')
        }).postFinishHook.on(test => {
            verifyAllFailed(test, t)

            t.is(test.assertions.length, 1)
        })
    })
})


it('`waitForComponentQueryVisible` / `waitForComponentQueryNotVisible` methods should work', async t => {
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`waitForComponentQueryVisible` method should work', async t => {
        const container = new Ext.container.Container({
            renderTo    : Ext.getBody()
        })

        let button

        const result        = await measureTrigger(
            t.waitForComponentQueryVisible('button[moo=zoo]'),
            () => setTimeout(() => {
                button          = new Ext.Button({ text : 'Button', moo : 'zoo' })

                container.add(button)
            }, defaultDelay)
        )

        t.eq(result.resolved, [ button ])

        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`waitForComponentQueryVisible` should fail correctly', async t => {

        it({ title : 'internal visible', isTodo : true, defaultTimeout : defaultDelay }, async t => {
            const button = new Ext.Button({
                text        : 'Button',
                moo         : 'zoo',
                renderTo    : Ext.getBody(),
                hidden      : true
            })
            await t.waitForComponentQueryVisible('button[moo=zoo]')
        }).postFinishHook.on(test => {
            verifyAllFailed(test, t)

            t.is(test.assertions.length, 1)
        })
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`waitForComponentQueryNotVisible` method should work', async t => {
        const button = new Ext.Button({
            text        : 'Button',
            moo         : 'zoo',
            renderTo    : Ext.getBody()
        })

        const result        = await measureTrigger(
            t.waitForComponentQueryNotVisible('button[moo=zoo]'),
            () => setTimeout(() => button.setHidden(true), defaultDelay)
        )

        t.eq(result.resolved, [ button ])

        t.isGreaterOrEqual(result.elapsed, defaultDelay)
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`waitForComponentQueryNotVisible` should fail correctly', async t => {

        it({ title : 'internal not visible', isTodo : true, defaultTimeout : defaultDelay }, async t => {
            const container = new Ext.Button({
                text        : 'Button',
                moo         : 'zoo',
                renderTo    : Ext.getBody()
            })

            await t.waitForComponentQueryNotVisible('button[moo=zoo]')
        }).postFinishHook.on(test => {
            verifyAllFailed(test, t)

            t.is(test.assertions.length, 1)
        })
    })
})
