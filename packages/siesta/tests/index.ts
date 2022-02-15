import { Project } from "../index.js"

const project = Project.new({
    title                   : 'Siesta 6 isomorphic test suite',

    testDescriptor          : {}
})

project.plan(
    {
        url       : 'util',

        items       : [
            'queued.t.js',
            'uniqable.t.js',
            'promise_sync.t.js',
            'rect.t.js'
        ]
    },
    {
        url       : 'hook',

        items       : [
            'hook.t.js',
        ]
    },
    {
        url    : 'jsx',

        items       : [
            'tree.t.js',
            'ul.t.js',
            'xml_element_streaming_rendering.t.js',
        ]
    },
    {
        url    : 'rpc',

        items       : [
            'port.t.js',
            'port_scoped.t.js'
        ]
    },
    {
        url    : 'serializer',

        items       : [
            'streaming_serializer_rendering.t.js'
        ]
    },
    {
        url    : 'compare_deep',

        items       : [
            'deep_diff_rendering.t.js',
            'deep_diff.t.js',
            'deep_diff_matchers.t.js',
            'deep_diff_rendering_max_width.t.js',
        ]
    },
    {
        url    : 'options',

        items       : [
            'parse_options.t.js'
        ]
    },
    {
        url    : 'siesta',

        items       : [
            {
                url    : 'assertions',

                items       : [
                    'assertion_async.t.js',
                    'assertion_compare.t.js',
                    'assertion_exception.t.js',
                    'assertion_function.t.js',
                    'assertion_type.t.js',
                    'expectation.t.js',
                    'silent.t.js'
                ]
            },
            {
                url    : 'test',

                items       : [
                    'spies.t.js',
                    'exception_handling.t.js',
                    'source_point.t.js'
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

