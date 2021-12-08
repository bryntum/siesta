import { beforeEach, it } from "../../sencha.js"

declare const Ext

it('Sencha-specific querying should work', async t => {
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const viewport = new Ext.Viewport({
        id              : 'viewport',

        items           : [
            {
                id              : 'panel1',
                title           : 'foo1',
                height          : 100,
                html            : '<div style="height:100%" class="quix" id="test_div1"></div>'
            },
            {
                id              : 'panel2',
                title           : 'foo2',
                html            : '<div style="height:100%" class="quix" id="test_div2"></div>',

                height          : 100,

                items           : [
                    {
                        xtype           : 'button',
                        text            : 'test',
                        id              : 'test-button'
                    }
                ]
            },
            {
                xtype           : 'textfield',
                cls             : 'test-field',
                id              : 'test-field'
            }
        ]
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('Sanity: regular CSS queries should still work', async t => {
        t.eq(t.query('body'), [ document.body ])
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`query` method should support component query', async t => {
        t.eq(t.query('>>#panel1'), [ Ext.getCmp('panel1').getEl().dom ], "Normalize element returns the root el of a component")
        t.eq(t.componentQuery('>>#panel1'), [ Ext.getCmp('panel1') ], "Normalize element returns the root el of a component")

        t.eq(t.query('>>panel button'), [ Ext.getCmp('test-button').getEl().dom ], "Normalize element returns the root el of a component")
        t.eq(t.componentQuery('>>panel button'), [ Ext.getCmp('test-button') ], "Normalize element returns the root el of a component")
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`query` method should support composite query', async t => {
        t.eq(
            t.query('viewport => div.quix'),
            [ Ext.get('test_div1').dom, Ext.get('test_div2').dom ],
            'Found the divs with class `quix` inside of whole viewport'
        )

        t.eq(
            t.compositeQuery('viewport => div.quix'),
            [ Ext.get('test_div1').dom, Ext.get('test_div2').dom ],
            'Found the divs with class `quix` inside of whole viewport'
        )

        t.eq(
            t.compositeQuery('panel[title=foo1] => div.quix'),
            [ Ext.get('test_div1').dom ],
            'Found the div with class `quix` only inside of panel1'
        )

        t.eq(
            t.compositeQuery('panel[title=foo1] => div.quix', Ext.getCmp('viewport')),
            [ Ext.get('test_div1').dom ],
            'Same result with specified root'
        )

        t.eq(
            t.compositeQuery('panel[title=foo1] => div.quix', Ext.getCmp('panel2')),
            [],
            'Not found any results with `panel2` as root'
        )
    })


    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    it('`compositeQuery` method should throw when provided with invalid selector', async t => {
        t.throwsOk(() => {
            t.compositeQuery('panel[title=foo]')
        }, '', 'Invalid composite query selector: panel[title=foo]')
    })

})

