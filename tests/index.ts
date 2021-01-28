import { ProjectIsomorphic } from "../src/siesta/project/ProjectIsomorphic.js"

const project = ProjectIsomorphic.new({
    title                   : 'Siesta 6 isomorphic test suite',

    testDescriptor          : {}
})

project.plan(
    // {
    //     filename       : 'uniqable',
    //
    //     items       : [
    //         'uniqable.t.js',
    //     ]
    // },
    // {
    //     filename       : 'hook',
    //
    //     items       : [
    //         'hook.t.js',
    //     ]
    // },
    {
        filename    : 'jsx',

        items       : [
            'text_block.t.js'
        ]
    },
    // {
    //     filename       : 'chained_iterator',
    //
    //     items       : [
    //         'chained_iterator.t.js',
    //     ]
    // },
    // {
    //     filename       : 'class',
    //
    //     items       : [
    //         'mixin.t.js',
    //         'mixin_caching.t.js'
    //     ]
    // },
    // {
    //     filename    : 'channel',
    //
    //     items       : [
    //         'channel.t.js'
    //     ]
    // },
    // {
    //     filename    : 'serializable',
    //
    //     items       : [
    //         'serializable.t.js'
    //     ]
    // },
    {
        filename    : 'serializer',

        items       : [
            // 'serializer.t.js',
            'serializer_xml.t.js',
            'stringifier_xml.t.js'
        ]
    },
    // {
    //     filename    : 'compare_deep',
    //
    //     items       : [
    //         'compare_deep.t.js'
    //     ]
    // },
    // {
    //     filename    : 'options',
    //
    //     items       : [
    //         'parse_options.t.js'
    //     ]
    // },
    // {
    //     filename    : 'siesta',
    //
    //     items       : [
    //         'test_descriptor.t.js'
    //     ]
    // },
)

project.start()

