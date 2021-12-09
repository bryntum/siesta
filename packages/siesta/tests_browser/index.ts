import { Project } from "../browser.js"

const project = Project.new({
    title                   : 'Siesta 6 browser test suite',

    testDescriptor          : {}
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
                        url         : 'preload.t.js',
                        failOnResourceLoadError : true,
                        preload     : [
                            {
                                code : () => {
                                    //@ts-ignore
                                    PRELOAD_INLINE = true
                                }
                            },
                            'preload_file.js',
                            { type : 'js', url : 'preload_file_module.js', isEcmaModule : true },

                            {
                                style : '.inline-class { margin : 10px }'
                            },
                            'preload_file.css',
                        ]
                    },
                ]
            },
        ]
    },
    {
        url         : 'sencha',

        preload     : [
            '../../../workspace/ext-7.4.0/build/classic/theme-classic/resources/theme-classic-all.css',
            '../../../workspace/ext-7.4.0/build/ext-all-debug.js'
        ],

        items       : [
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
            'query.t.js',
            'set_value.t.js'
        ]
    }
)

project.start()
