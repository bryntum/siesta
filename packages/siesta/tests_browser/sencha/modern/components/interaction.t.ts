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
