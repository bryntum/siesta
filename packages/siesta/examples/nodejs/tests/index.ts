import { Project } from "siesta/nodejs.js"

const project = Project.new({
    title                   : 'Awesome Node.js project test suite',
})

// by default, tests from the project directory are planned
// project.planDir('.')

project.start()
