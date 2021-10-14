import { Project } from "../entry/project_deno.js"

const project = Project.new({
    title                   : 'Siesta 6 Deno specific test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename    : 'plan',

        items       : [
            'project_plan.t.js'
        ]
    },
)

project.start()

