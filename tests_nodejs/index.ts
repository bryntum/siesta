import { Project } from "../nodejs.js"

const project = Project.new({
    title                   : 'Siesta 6 Node.js specific test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename    : 'jsx',

        items       : [
            'xml_element_rendering.t.js'
        ]
    },
)

project.start()

