import { Project } from "../../../index.js"

const project = Project.new({
    title                   : 'Awesome isomorphic project test suite',
})

// currently, isomorphic project does not have access to file system
// it needs to list all test files manually
project.plan(
    {
        url        : 'basic',

        items           : [
            'basic_test.t.js'
        ]
    },
    {
        url        : 'module',

        items           : [
            'delay.t.js',
            'summer.t.js',
            'zoomer.t.js'
        ]
    }
)

project.start()
