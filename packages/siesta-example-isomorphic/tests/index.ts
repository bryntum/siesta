import { Project } from "../node_modules/@bryntum/siesta/index.js"

const project = Project.new({
    title                   : 'Chained iterator test suite',

    testDescriptor          : {}
})

project.plan(
    'summer.t.js'
)

project.start()
