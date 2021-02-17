import { Project } from "../../index.js"

const project = Project.new({
    title                   : 'Isomorphic serverless test suite example',

    // global test-specific options
    testDescriptor          : {}
})

project.plan(
    {
        filename    : 'basic',

        tags        : [ 'basic' ],

        items       : [
            // {
            //     filename    : 'basic_test.t.js',
            // },
            // 'another_test.t.js'
        ]
    },
    {
        filename    : 'assertions',

        items       : [
            // 'is_deeply.t.js',
            // 'like.t.js',
            // 'general.t.js',
            'exception.t.js',
        ]
    },
    {
        filename    : 'advanced',

        tags        : [ 'advanced' ],

        items       : [
            // 'advanced_test.t.js'
        ]
    },
)

project.start()
