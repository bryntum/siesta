import { Project } from "../../../browser.js"

const project = Project.new({
    title                   : 'Browser test suite'
})

project.plan(
    'test_1.t.js',
    'test_2.t.js'
)

project.start()

