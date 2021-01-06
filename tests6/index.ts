import { GetIsomorphicProjectClass } from "../main.js"

// top-level `await` wrapper
(async () => {

const project = (await GetIsomorphicProjectClass()).new({
    title               : 'Siesta 6 isomorphic test suite',

    test                : {}
})

project.plan(
    {
        filename    : 'channel',

        items       : [
            'channel.t.js'
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

// top-level `await` wrapper
})()

