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
        filename       : 'simulation',

        items       : [
            'click.t.js',
        ]
    },
    {
        filename       : 'util',

        items       : [
            {
                filename       : 'scroll',

                items       : [
                    'is_element_point_scrolled_out.t.js',
                ]
            }
        ]
    }
)

project.start()
