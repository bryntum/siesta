import { Project } from "@bryntum/siesta/index.js"

const project = Project.new({
    title                   : 'Chained iterator test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename       : 'chained_iterator',

        items       : [
            'chained_iterator.t.js',
        ]
    }
)

project.start()
