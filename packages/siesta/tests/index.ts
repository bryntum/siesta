import { Project } from "../entry/project_isomorphic.js"

const project = Project.new({
    title                   : 'Siesta 6 isomorphic test suite',

    testDescriptor          : {}
})

project.plan(
    {
        filename       : 'util',

        items       : [
            'queued.t.js',
            'uniqable.t.js',
            'promise_sync.t.js',
            'rect.t.js'
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
        filename    : 'rpc',

        items       : [
            'port.t.js',
            'port_scoped.t.js'
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
            'compare_deep_diff.t.js',
            'compare_deep_diff_matchers.t.js',
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
                    'assertion_async.t.js',
                    'assertion_compare.t.js',
                    'assertion_exception.t.js',
                    'assertion_type.t.js',
                    'expectation.t.js',
                    'silent.t.js'
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

