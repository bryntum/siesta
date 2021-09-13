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
                filename    : 'mouse',

                items       : [
                    'click.t.js',
                    'click_change_target.t.js',
                    'click_svg.t.js',
                    'pointer_events.t.js'
                ]
            }
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
                    'is_element_point_cropped.t.js',
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
