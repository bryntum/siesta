import { GetIsomorphicProjectClass } from "../../main.js"

const project = (await GetIsomorphicProjectClass()).new({
    name                    : 'Siesta test suite',

    // global test-specific options
    options                 : {}
})

project.plan([
    {
        filename    : 'advanced',

        tags        : [ 'advanced' ],

        items       : [
            'advanced_test.t.js'
        ]
    },
    {
        filename    : 'basic',

        tags        : [ 'basic' ],

        items       : [
            {
                filename    : 'basic_test.t.js'
            }
        ]
    }
])

project.start()

