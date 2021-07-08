import { Project } from "../index.js"

const project = Project.new({
    title                   : 'Siesta 6 browser test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename       : 'chronograph_jsx',

        items       : [
            'chronograph_jsx.t.js'
        ]
    }
)

project.start()
