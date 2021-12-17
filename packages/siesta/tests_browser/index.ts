import { Project } from "../browser.js"

const project = Project.new({
    title                   : 'Siesta 6 browser test suite',

    testDescriptor          : {}
})


const senchaGroup = (version : string) => new Object({
    unique      : true,
    url         : 'sencha',
    title       : `Sencha: ${ version }`,

    preload     : [
        `../../workspace/extjs-${ version }/build/classic/theme-classic/resources/theme-classic-all.css`,
        `../../workspace/extjs-${ version }/build/ext-all-debug.js`
    ],

    items       : [
        {
            url     : 'assertion',
            items   : [
                'assertion_component.t.js',
                'assertion_form_field.t.js'
            ]
        },
        {
            url     : 'components',
            items   : [
            ]
        },
        {
            url     : 'simulation',
            items   : [
                {
                    url     : 'keyboard',
                    items   : [
                        'type.t.js'
                    ]
                },
                {
                    url     : 'mouse',
                    items   : [
                        'click.t.js'
                    ]
                }
            ]
        },
        {
            url     : 'modern',
            preload     : [
                `../../workspace/extjs-${ version }/build/modern/theme-material/resources/theme-material-all.css`,
                `../../workspace/extjs-${ version }/build/ext-modern-all-debug.js`
            ],
            items   : [
                {
                    url     : 'components',
                    items   : [
                        'interaction.t.js'
                    ]
                }
            ]
        },
        'query.t.js',
    ]
})


project.plan(
    {
        url       : 'chronograph_jsx',

        items       : [
            'plain_jsx.t.js',
            'component.t.js',
            'web_component.t.js'
        ]
    },
    {
        url       : 'serializer',

        items       : [
            'serializer_xml.t.js',
        ]
    },
    {
        url       : 'simulation',

        items       : [
            {
                url    : 'keyboard',

                items       : [
                    'backspace_delete.t.js',
                    'caret_position.t.js',
                    'change_event.t.js',
                    'content_editable.t.js',
                    'enter_in_form.t.js',
                    'modifier_keys.t.js',
                    'readonly.t.js',
                    'tabbing.t.js',
                    'text_selection.t.js',
                    'type.t.js',
                    'type_iframe.t.js',
                    'web_component.t.js'
                ]
            },
            {
                url    : 'mouse',

                items       : [
                    'click.t.js',
                    'click_change_target.t.js',
                    'click_iframe.t.js',
                    'click_svg.t.js',
                    'drag.t.js',
                    'focus.t.js',
                    'modifier_keys.t.js',
                    'mouse_move.t.js',
                    'mouse_over.t.js',
                    'offset.t.js',
                    'pointer_events.t.js',
                    { url : 'scroll_into_view.t.js', expandBody : false },
                    'transformed_element.t.js',
                    'wait_for_target.t.js',
                    'web_component.t.js'
                ]
            },
            {
                url    : 'targeting',

                items       : [
                    'actionability_checks.t.js',
                    'query.t.js'
                ]
            },
        ]
    },
    {
        url       : 'util',

        items       : [
            {
                url       : 'coordinates',

                items       : [
                    'filter_path.t.js',
                    'offset.t.js'
                ]
            },
            {
                url       : 'dom',

                items       : [
                    'element_from_point.t.js'
                ]
            },
            {
                url       : 'scroll',

                items       : [
                    'scroll_element_into_view.t.js',
                    // TODO move the test itself once we support `export config = {}`
                    { url : 'scroll_element_into_view_2.t.js', expandBody : false },
                ]
            }
        ]
    },
    {
        url    : 'siesta',

        items       : [
            {
                url    : 'assertions',

                items       : [
                    'assertion_element.t.js',
                    'assertion_observable.t.js',
                    'silent.t.js',
                ]
            },
            {
                url    : 'test',

                items       : [
                    {
                        url         : 'pageUrl.t.js',
                        pageUrl     : 'siesta/test/page.html'
                    },
                    {
                        url         : 'pageUrl.t.js',
                        unique      : true,
                        pageUrlRel  : 'page.html'
                    },
                    {
                        url         : 'preload.t.js',
                        failOnResourceLoadError : true,
                        preload     : [
                            {
                                code : () => {
                                    //@ts-ignore
                                    PRELOAD_INLINE = true
                                }
                            },
                            './siesta/test/preload_file.js',
                            { type : 'js', url : 'siesta/test/preload_file_module.js', isEcmaModule : true },

                            {
                                style : '.inline-class { margin : 10px }'
                            },
                            '../tests_browser/siesta/test/preload_file.css',
                        ]
                    },
                    {
                        url         : 'preload.t.js',
                        unique      : true,
                        failOnResourceLoadError : true,
                        preloadRel  : [
                            {
                                code : () => {
                                    //@ts-ignore
                                    PRELOAD_INLINE = true
                                }
                            },
                            './preload_file.js',
                            { type : 'js', url : 'preload_file_module.js', isEcmaModule : true },

                            {
                                style : '.inline-class { margin : 10px }'
                            },
                            '../test/preload_file.css',
                        ]
                    },
                ]
            },
        ]
    },
    {
        title   : "Sencha all versions",
        url     : './',

        items   : [
            senchaGroup('7.4.0'),
            senchaGroup('7.3.1'),
            senchaGroup('7.2.0'),
            senchaGroup('6.7.0'),
            senchaGroup('6.6.0'),
            senchaGroup('6.5.3')
        ]
    },
    {
        pageUrlRel  : '@my-app/build/testing/MyExtGenApp/index.html',
        url         : 'sencha/cmd_app.t.js'
    }
)

project.start()
