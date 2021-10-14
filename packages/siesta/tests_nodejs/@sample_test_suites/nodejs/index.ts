import { Project } from "../../../entry/project_nodejs.js"

const project = Project.new({
    title                   : 'Node.js test suite'
})

// by default, w/o any `project.plan*` calls, Node.js project includes all `*.t.m?js` files from the project file directory

project.start()

