import { ProjectIsomorphic } from "../src/siesta/project/ProjectIsomorphic.js"

const project = ProjectIsomorphic.new({
    title                   : 'Siesta 6 isomorphic test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename    : 'channel',

        items       : [
            'channel.t.js'
        ]
    },
    {
        filename    : 'serializable',

        items       : [
            'serializable.t.js'
        ]
    },
    {
        filename    : 'options',

        items       : [
            'parse_options.t.js'
        ]
    },
)

project.start()

