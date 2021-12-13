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
it('Should be able to type in the field with regexp validation', async t => {
    const tf = new Ext.form.field.Text({
        renderTo   : Ext.getBody(),
        name       : 'name',
        fieldLabel : 'Name',

        maskRe     : /[\d\-]/,
        regex      : /^\d{3}-\d{3}-\d{4}$/,

        regexText  : 'Must be in the format xxx-xxx-xxxx'
    })

    await t.type(tf, 'Abracadabra123-456-7890')

    t.fieldHasValue('[name=name]', "123-456-7890")
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

