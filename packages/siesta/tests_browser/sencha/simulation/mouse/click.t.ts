import { beforeEach, it } from "../../../../sencha.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
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
    let clicked         = false

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

                listeners       : {
                    click : () => clicked = true
                }
            }
        ]
    })

    await t.click('>>button[text=Button2]')

    t.true(clicked)
})

