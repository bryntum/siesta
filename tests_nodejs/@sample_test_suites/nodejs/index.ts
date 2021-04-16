import { Project } from "../../../nodejs.js"

const project = Project.new({
    title                   : 'Node.js test suite'
})

// Node.js project includes all `*.t.m?js` files from the project file directory

project.start()

