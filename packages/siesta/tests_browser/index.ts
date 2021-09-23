import { Project } from "../browser.js"

const project = Project.new({
    title                   : 'Siesta 6 browser test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename       : 'chronograph_jsx',

        items       : [
            'plain_jsx.t.js',
            'component.t.js',
            'web_component.t.js'
        ]
    },
    {
        filename       : 'serializer',

        items       : [
            'serializer_xml.t.js',
        ]
    },
    {
        filename       : 'simulation',

        items       : [
            {
                filename    : 'keyboard',

                items       : [
                    'caret_position.t.js',
                    'change_event.t.js',
                    'readonly.t.js',
                    'text_selection.t.js',
                    'type.t.js',
                    'type_iframe.t.js',
                ]
            },
            {
                filename    : 'mouse',

                items       : [
                    'click.t.js',
                    'click_iframe.t.js',
                    'click_change_target.t.js',
                    'click_svg.t.js',
                    'mouse_move.t.js',
                    'mouse_over.t.js',
                    'pointer_events.t.js'
                ]
            },
            {
                filename    : 'targeting',

                items       : [
                    'actionability_checks.t.js'
                ]
            },
        ]
    },
    {
        filename       : 'util',

        items       : [
            {
                filename       : 'coordinates',

                items       : [
                    'filter_path.t.js',
                    'offset.t.js'
                ]
            },
            {
                filename       : 'dom',

                items       : [
                    'element_from_point.t.js'
                ]
            },
            {
                filename       : 'scroll',

                items       : [
                    'scroll_element_into_view.t.js'
                ]
            }
        ]
    },
    {
        filename    : 'siesta',

        items       : [
            {
                filename    : 'assertions',

                items       : [
                    'assertion_observable.t.js',
                ]
            },
        ]
    }
)

project.start()
