import { beforeEach, it } from "../../../../sencha.js"

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => comp.destroy())
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Interacting with the checkbox', async t => {
    const cmp = Ext.create('Ext.field.Checkbox', {
        width       : 100,
        checked     : false,
        renderTo    : document.body
    })

    await t.click(cmp)

    t.is(cmp.getChecked(), true, 'Checkbox should be checked after click')

    await t.click(cmp)

    t.is(cmp.getChecked(), false, 'Checkbox should be unchecked after 2nd click')
})

//
//     //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     it('`query` method should support component query', async t => {
//         t.eq(t.query('>>#panel1'), [ Ext.getCmp('panel1').getEl().dom ], "Normalize element returns the root el of a component")
//
//         t.eq(t.query('>>panel button'), [ Ext.getCmp('test-button').getEl().dom ], "Normalize element returns the root el of a component")
//     })
//
//
//     //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     it('`query` method should support composite query', async t => {
//         t.eq(
//             t.query('viewport => div.quix'),
//             [ Ext.get('test_div1').dom, Ext.get('test_div2').dom ],
//             'Found the divs with class `quix` inside of whole viewport'
//         )
//
//         t.eq(
//             t.query('#panel2 => #test_div2'),
//             [ Ext.get('test_div2').dom ]
//         )
//     })
//
//
//     //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     it('`componentQuery` method should work', async t => {
//         t.eq(t.componentQuery('>>#panel1'), [ Ext.getCmp('panel1') ], "Normalize element returns the root el of a component")
//
//         t.eq(t.componentQuery('>>panel button'), [ Ext.getCmp('test-button') ], "Normalize element returns the root el of a component")
//     })
//
//
//     //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     it('`compositeQuery` method should work', async t => {
//         t.eq(
//             t.compositeQuery('viewport => div.quix'),
//             [ Ext.get('test_div1').dom, Ext.get('test_div2').dom ],
//             'Found the divs with class `quix` inside of whole viewport'
//         )
//
//         t.eq(
//             t.compositeQuery('panel[title=foo1] => div.quix'),
//             [ Ext.get('test_div1').dom ],
//             'Found the div with class `quix` only inside of panel1'
//         )
//
//         t.eq(
//             t.compositeQuery('panel[title=foo1] => div.quix', Ext.getCmp('viewport')),
//             [ Ext.get('test_div1').dom ],
//             'Same result with specified root'
//         )
//
//         t.eq(
//             t.compositeQuery('panel[title=foo1] => div.quix', Ext.getCmp('panel2')),
//             [],
//             'Not found any results with `panel2` as root'
//         )
//     })
//
//
//     //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     it('`compositeQuery` method should throw when provided with invalid selector', async t => {
//         t.throwsOk(() => {
//             t.compositeQuery('panel[title=foo]')
//         }, '', 'Invalid composite query selector: panel[title=foo]')
//     })
//
//
//     //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     it('`cqExists` method should work', async t => {
//         t.cqExists('[title=foo1]')
//         t.not.cqExists('[title=zoo]')
//
//         t.cqNotExists('[title=zoo]')
//         t.not.cqNotExists('[title=foo1]')
//     })
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Should be able to normalize a nested CSQ where CSS match is not found in the first top component match', t => {
//     Ext.create('Ext.form.FieldSet', {
//         renderTo : document.body,
//         items : [
//             { xtype : 'radiofield' }
//         ]
//     })
//
//     Ext.create('Ext.form.FieldSet', {
//         renderTo : document.body,
//         items : [
//             { xtype : 'radiofield', cls : 'foo'}
//         ]
//     })
//
//     Ext.create('Ext.form.FieldSet', {
//         renderTo : document.body,
//         items : [
//             { xtype : 'radiofield'}
//         ]
//     })
//
//     t.eq(t.compositeQuery('fieldset => .foo'), [ t.cq1('[cls=foo]').el.dom ])
// })
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Querying for unrendered components should not throw', async t => {
//     const button = new Ext.button.Button({ foo : true })
//
//     t.eq(Ext.ComponentQuery.query('[foo]'), [ button ])
//     t.eq(t.componentQuery('[foo]'), [ button ])
//
//     t.eq(
//         t.query('>> [foo]'), [],
//         'Querying for unrendered components returns empty array (since such components dont have elements) and query is resolved till elements'
//     )
// })
