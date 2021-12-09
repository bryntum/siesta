import { beforeEach, it } from "../../../../sencha.js"
import { verifyAllFailed } from "../../../../tests/siesta/@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => comp.destroy())
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
