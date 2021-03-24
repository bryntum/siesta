import { Project } from "../index.js"

const project = Project.new({
    title                   : 'Siesta 6 isomorphic test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename       : 'uniqable',

        items       : [
            'uniqable.t.js',
        ]
    },
    {
        filename       : 'hook',

        items       : [
            'hook.t.js',
        ]
    },
    {
        filename    : 'jsx',

        items       : [
            'text_block.t.js',
            'xml_element_rendering.t.js'
        ]
    },
    {
        filename       : 'chained_iterator',

        items       : [
            'chained_iterator.t.js',
        ]
    },
    {
        filename       : 'class',

        items       : [
            'mixin.t.js',
            'mixin_caching.t.js'
        ]
    },
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
        filename    : 'serializer',

        items       : [
            'serializer_xml.t.js',
            'serializer_rendering.t.js'
        ]
    },
    {
        filename    : 'compare_deep',

        items       : [
            'compare_deep.t.js',
            'compare_deep_diff.t.js',
            'compare_deep_diff_rendering.t.js',
            'compare_deep_diff_rendering_max_width.t.js'
        ]
    },
    {
        filename    : 'options',

        items       : [
            'parse_options.t.js'
        ]
    },
    {
        filename    : 'siesta',

        items       : [
            {
                filename    : 'assertions',

                items       : [
                    'assertion_compare.t.js',
                    'assertion_exception.t.js',
                    'assertion_type.t.js',
                    'expectation.t.js'
                ]
            },
            {
                filename    : 'test',

                items       : [
                    'spies.t.js',
                ]
            },
            'test_descriptor.t.js',
            'before_after_each.t.js',
            'todo_tests.t.js',
            'snooze_tests.t.js',
            'global_test.t.js',
        ]
    },
)

project.start()

