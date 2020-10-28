import { Project } from "../../main.js"

const project = Project.new({
    name                    : 'Siesta test suite'
})


project.planGlob('**/*.t.js')

project.start()

