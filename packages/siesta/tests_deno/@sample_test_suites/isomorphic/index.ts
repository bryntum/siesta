import { Project } from "../../../entry/project_isomorphic.js"

const project = Project.new({
    title                   : 'Isomorphic test suite'
})

project.plan(
    'test_1.t.js',
    'test_2.t.js'
)

project.start()

