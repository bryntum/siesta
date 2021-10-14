import { Project } from "../entry/project_browser.js"

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
                filename    : 'mouse',

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
                    { filename : 'scroll_into_view.t.js', expandBody : false },
                    'transformed_element.t.js',
                    'wait_for_target.t.js',
                    'web_component.t.js'
                ]
            },
            {
                filename    : 'targeting',

                items       : [
                    'actionability_checks.t.js',
                    'query.t.js'
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
                    'scroll_element_into_view.t.js',
                    // TODO move the test itself once we support `export config = {}`
                    { filename : 'scroll_element_into_view_2.t.js', expandBody : false },
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
                    'assertion_element.t.js',
                    'assertion_observable.t.js',
                    'silent.t.js',
                ]
            },
        ]
    }
)

project.start()
