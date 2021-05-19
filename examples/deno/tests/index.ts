import { Project } from "../siesta_deno.ts"

const project = Project.new({
    title                   : 'Awesome Deno project test suite',
})

// by default, tests from the project directory are planned
// project.planDir('.')

project.start()
