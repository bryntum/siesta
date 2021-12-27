import { Project } from "@bryntum/siesta/browser.js"

const project = Project.new({
    title                   : 'Chained iterator test suite',

    testDescriptor          : {}
})

project.plan(
    'summer.t.js'
)

project.start()
