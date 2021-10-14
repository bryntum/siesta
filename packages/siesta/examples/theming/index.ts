import { Project } from "../../entry/project_isomorphic.js"

/*
    This project contains various examples of failing assertions.
    Its main purpose is to be able to review the theming of the
    output easily, which might be useful if you want to create
    a custom theme.
*/

const project = Project.new({
    title                   : 'Theming example',
})

project.plan(
    {
        filename    : 'theme',

        items       : [
            'equality.t.js',
            'exception.t.js',
            'general.t.js',
            'likeness.t.js',
            'log_messages.t.js',
        ]
    },
)

project.start()
