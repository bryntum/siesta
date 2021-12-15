import { Project } from "@bryntum/siesta/browser.js"

const project = Project.new({
    title                   : 'Chained iterator test suite',

    testDescriptor          : {}
})

project.plan(
    {
        url         : 'chained_iterator',

        items       : [
            'chained_iterator.t.js',
        ]
    }
)

project.start()
