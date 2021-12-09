import { beforeEach, it } from "../../../../sencha.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => comp.destroy())
})

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`type` action should support composite query', async t => {
    const panel        = new Ext.Panel({
        renderTo        : document.body,

        items           : [
            {
                xtype           : 'textfield',
                cls             : 'test-field',
                id              : 'test-field'
            }
        ]
    })

    await t.type('panel => .test-field input', 'Some text')

    t.is(Ext.getCmp('test-field').getValue(), 'Some text', 'The result of the composite query, passed as argument to the `t.type` is correct')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`type` action should support component query', async t => {
    const panel        = new Ext.Panel({
        renderTo        : document.body,

        items           : [
            {
                xtype           : 'textfield',
            },
            {
                xtype           : 'textfield',
                id              : 'test-field2',

                zoo             : true
            }
        ]
    })

    await t.type('>>textfield[zoo]', 'Some text')

    t.is(Ext.getCmp('test-field2').getValue(), 'Some text', 'The result of the composite query, passed as argument to the `t.type` is correct')
})

