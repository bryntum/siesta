import { Project } from "../../../nodejs.js"

const project = Project.new({
    title                   : 'Node.js test suite'
})

project.plan(
    'test_1.t.js',
    'test_2.t.js'
)

project.start()

