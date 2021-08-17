import { Project } from "../nodejs.js"

const project = Project.new({
    title                   : 'Siesta 6 Node.js specific test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename    : 'compare_deep',

        items       : [
            'compare_deep_diff_rendering.t.js',
        ]
    },
    {
        filename    : 'jsx',

        items       : [
            'xml_element_rendering.t.js'
        ]
    },
    {
        filename    : 'suite_launching',

        items       : [
            'suite_launching.t.js'
        ]
    },
    {
        filename    : 'plan',

        items       : [
            'project_plan.t.js'
        ]
    },
)

project.start()

