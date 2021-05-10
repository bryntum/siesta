import { Project } from "../../../deno.js"

const project = Project.new({
    title                   : 'Deno test suite'
})

// by default, w/o any `project.plan*` calls, Deno project includes all `*.t.m?js` files from the project file directory

project.start()

