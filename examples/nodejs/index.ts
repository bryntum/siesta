import { Project } from "../../main.js"

const project = Project.new({
    name                    : 'Siesta test suite'
})


project.planGlob('**/*.t.js')

project.planDir('tests')

project.planFile('some_test.t.js')

project.start()

