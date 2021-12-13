import { beforeEach, it } from "../../../../sencha.js"

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => {
        // as usually, Ext grid in 7.4 throws exceptions when being destroyed
        try { comp.destroy() } catch (e) {}
    })
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Toggle field', async t => {
    Ext.create({
        xtype       : 'togglefield',
        label       : 'Toggle',
        renderTo    : document.body
    })

    t.is(t.cq1('togglefield').getValue(), false, "Togglefield is unchecked")

    await t.click('>> togglefield')

    t.is(t.cq1('togglefield').getValue(), true, "Togglefield has been checked")
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Form submit', async t => {
    Ext.create('Ext.form.Panel', {
        renderTo   : document.body,
        items      : [
            {
                xtype : 'searchfield',
                name  : 'name',
                label : 'Name'
            },
            {
                xtype : 'emailfield',
                name  : 'email',
                label : 'Email'
            },
            {
                xtype : 'passwordfield',
                name  : 'password',
                label : 'Password'
            }
        ]
    })

    let form        = t.$('form') as HTMLFormElement

    form.submit     = () => {}

    t.isntCalled("submit", form, 'Expect a form NOT to be posted on ENTER press if event is prevented')

    await t.type('>>searchfield', '[ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Text field', async t => {
    const text = Ext.create('Ext.field.Text', { renderTo : document.body })

    await t.type(text, 'f')

    t.is(text.getValue(), 'f')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Grid', async t => {
    const store = Ext.create('Ext.data.Store', {
        fields: ['name', 'email', 'phone'],
        data: [
            { 'name': 'Lisa',  "email": "lisa@simpsons.com",  "phone": "555-111-1224" },
            { 'name': 'Bart',  "email": "bart@simpsons.com",  "phone": "555-222-1234" },
            { 'name': 'Homer', "email": "home@simpsons.com",  "phone": "555-222-1244" },
            { 'name': 'Marge', "email": "marge@simpsons.com", "phone": "555-222-1254" }
        ]
    })

    const grid = Ext.create('Ext.grid.Grid', {
        title   : 'Simpsons',
        store   : store,

        columns : [
            { text: 'Name',  dataIndex: 'name', width: 200 },
            { text: 'Email', dataIndex: 'email', width: 250 },
            { text: 'Phone', dataIndex: 'phone', width: 120 }
        ],

        height      : 200,
        renderTo    : document.body
    })

    await t.waitForSelector('.x-gridrow')

    const rowNode = t.getRow(grid, 0)

    t.true(rowNode, 'row node returned')
    t.like(rowNode.dom.innerHTML, 'Lisa')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Move mouse to select field', async t => {
    const selectField     = Ext.create({
        xtype: 'selectfield',
        label: 'Choose one',
        options: [{
            text: 'First Option',
            value: 'first'
        }, {
            text: 'Second Option',
            value: 'second'
        }, {
            text: 'Third Option',
            value: 'third'
        }],
        renderTo    : document.body
    })

    t.firesOnce(selectField, 'change')

    await t.click('>>selectfield')

    await t.waitForEvent(selectField, 'change', {
        trigger : async () => await t.click('.x-listitem:contains(Second Option)')
    })
})
