import { beforeEach, it } from "../../../sencha.js"

declare const Ext

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    Ext.ComponentQuery.query('component').forEach(comp => comp.destroy())
})

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`fieldHasValue` assertion should work', async t => {
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

    await t.type('>>#test-field', 'Some text')

    t.fieldHasValue('#test-field', 'Some text')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`setValue` method should work for text field', async t => {
    const textField = new Ext.form.field.Text({
        renderTo    : document.body,
        zoo         : 'moo'
    })

    t.setValue(textField, 'foo')

    t.is(textField.getValue(), 'foo')


    t.setValue('>>[zoo=moo]', 'goo')

    t.is(textField.getValue(), 'goo')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`setValue` method should work for checkbox field', async t => {
    const checkbox = new Ext.form.field.Checkbox({
        renderTo : document.body
    })

    t.setValue(checkbox, true)

    t.is(checkbox.getValue(), true)
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`setValue` method should work for combobox field', async t => {
    const combo = new Ext.form.field.ComboBox({
        renderTo : document.body,
        store    : ['Foo', 'Bar']
    })

    t.setValue(combo, 'Foo')

    t.is(combo.getValue(), 'Foo')
})

