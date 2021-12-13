import { beforeEach, it } from "../../../../sencha.js"
import { verifyAllFailed } from "../../../../tests/siesta/@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('widget').forEach(comp => {
        try { comp.destroy() } catch (e) {}
    })
})

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`click` action should support composite query', async t => {
    const panel        = new Ext.Panel({
        renderTo        : document.body,

        items           : [
            {
                xtype           : 'button',
                cls             : 'test-button',
                text            : 'Button'
            }
        ]
    })

    t.firesOk('panel => .test-button', 'click', 1)

    await t.click('panel => .test-button')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`click` action should support component query', async t => {
    const panel        = new Ext.Panel({
        renderTo        : document.body,

        items           : [
            {
                xtype           : 'button',
                cls             : 'test-button',
                text            : 'Button1'
            },
            {
                xtype           : 'button',
                cls             : 'test-button',
                text            : 'Button2',
            }
        ]
    })

    t.firesOk('>>button[text=Button2]', 'click', 1)

    await t.click('>>button[text=Button2]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('should be able to click on widgets', async t => {

    const treeStore = new Ext.data.TreeStore({
        fields      : [ 'id', 'text' ],

        root        : {
            text        : 'root',
            expanded    : true,

            children    : [
                { id : 1, text : "1", leaf : true },
                {
                    id : 2, text : "2", expanded : true, children : [
                        { id : 3, text : "3", leaf : true },
                        { id : 4, text : "4", leaf : true }
                    ]
                },
                { id : 5, text : "5", leaf : true }
            ]
        }
    })

    const treeList    = new Ext.list.Tree({
        renderTo    : Ext.getBody(),
        store       : treeStore,

        width       : 400,
        height      : 300
    })

    t.firesOnce(t.cq1('>>treelistitem[text=3]').el, 'click')

    await t.click('>>treelistitem[text=3]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not crash when clicking unrendered component', async t => {

    t.it({ title : 'internal', isTodo : true, defaultTimeout : 100 }, async t => {
        await t.click(new Ext.button.Button())
    }).postFinishHook.on(test => {
        verifyAllFailed(test, t)

        t.is(test.assertions.length, 1)
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Ext checkbox in form', async t => {
    const cb = new Ext.form.Checkbox({
        fieldLabel : 'Label',
        boxLabel   : 'Search Both',
        anchor     : '100%'
    })

    let simple = new Ext.form.FormPanel({
        layout   : 'form',
        renderTo : Ext.getBody(),
        width    : 150,
        items    : cb
    })

    await t.click(cb)

    t.ok(cb.getValue(), 'Ext Form checkbox should be checked after clicking it')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Ext checkbox standalone', async t => {
    const cb2 = new Ext.form.Checkbox({ renderTo : document.body })

    await t.click(cb2)

    t.true(cb2.getValue(), 'Checkbox 2 should be checked after clicking it')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Ext radiobox standalone', async t => {
    const radio = new Ext.form.Radio({ renderTo : document.body })

    await t.click(radio)

    t.true(radio.getValue(), 'Radio should be checked after clicking it')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Ext radiogroup', async t => {
    Ext.create('Ext.form.Panel', {
        width    : 300,
        height   : 125,
        renderTo : document.body,
        items    : [{
            xtype      : 'radiogroup',
            fieldLabel : 'Two Columns',
            // Arrange radio buttons into two columns, distributed vertically
            columns    : 2,
            vertical   : true,
            items      : [
                { boxLabel : 'Item1', name : 'rb', inputValue : '1' },
                { boxLabel : 'Item2', name : 'rb', inputValue : '2', checked : true }
            ]
        }]
    })

    await t.click('>>[boxLabel=Item1]')

    t.true(t.cq1('[boxLabel=Item1]').getValue(), 'Checkbox 2 should be checked after clicking it')
})
